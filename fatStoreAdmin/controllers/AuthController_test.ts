import { assertEquals } from "@std/assert";
import AuthController from "./AuthController.ts";
import { ControllerError, ServiceError, serviceTypes } from "./externals.ts";
import { assertIsError } from "@std/assert/is-error";

const permissions = {
  isRolePermitted: (role: string, services: string, method: string) => true,
  createUser: (email: string, password: string, table: string) =>
    Promise.resolve(true),
  login: (email: string, password: string, roleType: string, role: string) =>
    Promise.resolve(true),
};

const validator = {
  validate: (schema: Object, data: Object) => true,
  getSchema: (schema: string) => true,
};

Deno.test({
  name:
    "AuthController proceeds through createAccount success path without knowing the return value",
  async fn() {
    const params: [serviceTypes.tValidator, serviceTypes.IPermissions] = [
      validator as unknown as serviceTypes.tValidator,
      permissions as unknown as serviceTypes.IPermissions,
    ];
    const controller = new AuthController(...params);
    const hasCreatedAccount = await controller
      .createAccount(
        "valid email",
        "valid password",
        "seller",
        "visitor",
      );
    const isSuccess = hasCreatedAccount as unknown as boolean;
    assertEquals(isSuccess, true, "has returned success value");
  },
});

Deno.test({
  name:
    "AuthController createAccount returns ControllerError at validation error",
  async fn() {
    const erroredValidator = {
      ...validator,
      validate: (schema: Object, data: Object) => false,
    };
    const params: [serviceTypes.tValidator, serviceTypes.IPermissions] = [
      erroredValidator as unknown as serviceTypes.tValidator,
      permissions as unknown as serviceTypes.IPermissions,
    ];
    const controller = new AuthController(...params);
    const response = await controller.createAccount(
      "invalid email",
      "or invalid password",
      "seller",
      "visitor",
    );
    assertIsError(response);
    assertEquals(response instanceof ControllerError, true);
    assertEquals(response.message, "Invalid arguments.");
    assertEquals(response.code, 400);
  },
});

Deno.test({
  name: "AuthController createAccount returns ControllerError at invalid role",
  async fn() {
    const errorPermissions = {
      ...permissions,
      isRolePermitted: (role: string, services: string, method: string) =>
        false,
    };
    const params: [serviceTypes.tValidator, serviceTypes.IPermissions] = [
      validator as unknown as serviceTypes.tValidator,
      errorPermissions as unknown as serviceTypes.IPermissions,
    ];
    const controller = new AuthController(...params);

    // * only visitor and root roles can use this api
    const response = await controller.createAccount(
      "invalid email",
      "or invalid password",
      "seller",
      "seller",
    );

    assertIsError(response);
    assertEquals(response instanceof ControllerError, true);
    assertEquals(response.message, "Unauthorized service access.");
    assertEquals(response.code, 401);
  },
});

Deno.test("AuthController login returns ControllerError at validation error", async () => {
  const erroredValidator = {
    ...validator,
    validate: () => false,
  };

  const controller = new AuthController(
    erroredValidator as unknown as serviceTypes.tValidator,
    permissions as unknown as serviceTypes.IPermissions,
  );

  const response = await controller.login(
    "bad@email.com",
    "pass",
    "seller",
    "seller",
  );

  assertIsError(response);
  assertEquals(response instanceof ControllerError, true);
  assertEquals(response.message, "Invalid arguments.");
  assertEquals(response.code, 400);
});

Deno.test("AuthController login returns ServiceError for visitor role", async () => {
  const controller = new AuthController(
    validator as unknown as serviceTypes.tValidator,
    permissions as unknown as serviceTypes.IPermissions,
  );

  const response = await controller.login("any", "any", "visitor", "visitor");

  assertIsError(response);
  assertEquals(response instanceof ServiceError, true);
  assertEquals(response.message, "Internal Server Error.");
});

Deno.test("AuthController login returns ControllerError for invalid root credentials", async () => {
  Deno.env.set("ROOT_USER", "admin");
  Deno.env.set("ROOT_PASS", "correct");

  const controller = new AuthController(
    validator as unknown as serviceTypes.tValidator,
    permissions as unknown as serviceTypes.IPermissions,
  );

  const response = await controller.login("admin", "wrongpass", "root", "root");

  assertIsError(response);
  assertEquals(response instanceof ControllerError, true);
  assertEquals(response.message, "Invalid email and/or password.");
  assertEquals(response.code, 401);
});

Deno.test("AuthController login returns ControllerError for unauthorized access to getUserByEmail", async () => {
  const restrictedPerms = {
    ...permissions,
    isRolePermitted: () => false,
  };

  const controller = new AuthController(
    validator as unknown as serviceTypes.tValidator,
    restrictedPerms as unknown as serviceTypes.IPermissions,
  );

  const response = await controller.login(
    "user@email.com",
    "password",
    "seller",
    "seller",
  );

  assertIsError(response);
  assertEquals(response instanceof ControllerError, true);
  assertEquals(response.message, "Unauthorized service access.");
  assertEquals(response.code, 401);
});

Deno.test("AuthController login returns ControllerError when no user found", async () => {
  const mockPerms = {
    ...permissions,
    getUserByEmail: () => Promise.resolve([]), // simulate empty result
    isRolePermitted: () => true,
  };

  const controller = new AuthController(
    validator as unknown as serviceTypes.tValidator,
    mockPerms as unknown as serviceTypes.IPermissions,
  );

  const response = await controller.login(
    "none@here.com",
    "whatever",
    "seller",
    "seller",
  );

  assertIsError(response);
  assertEquals(response instanceof ControllerError, true);
  assertEquals(response.message, "No account found.");
  assertEquals(response.code, 404);
});

Deno.test("AuthController login returns ControllerError on incorrect password", async () => {
  const mockPerms = {
    ...permissions,
    isRolePermitted: () => true,
    getUserByEmail: () =>
      Promise.resolve([
        {
          email: "user@email.com",
          password: "hashed-pass",
          sellerId: "123",
        },
      ]),
    hashPassword: () => Promise.resolve("not-matching-hash"),
  };

  const controller = new AuthController(
    validator as unknown as serviceTypes.tValidator,
    mockPerms as unknown as serviceTypes.IPermissions,
  );

  const response = await controller.login(
    "user@email.com",
    "wrongpass",
    "seller",
    "seller",
  );

  assertIsError(response);
  assertEquals(response instanceof ControllerError, true);
  assertEquals(response.message, "Password incorrect.");
  assertEquals(response.code, 401);
});

Deno.test("AuthController login returns token for non-root role on correct credentials", async () => {
  const token = "valid.jwt.token";
  const mockPerms = {
    ...permissions,
    isRolePermitted: () => true,
    getUserByEmail: () =>
      Promise.resolve([
        {
          email: "user@email.com",
          password: "correct-hash",
          sellerId: "abc123",
        },
      ]),
    hashPassword: () => Promise.resolve("correct-hash"),
    encodeSession: (
      payload: Record<string, unknown>,
      options: Record<string, string>,
    ) => Promise.resolve(token),
  };

  const controller = new AuthController(
    validator as unknown as serviceTypes.tValidator,
    mockPerms as unknown as serviceTypes.IPermissions,
  );

  const response = await controller.login(
    "user@email.com",
    "rightpass",
    "seller",
    "seller",
  );

  assertEquals(response, { token });
});
