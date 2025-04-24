import { ControllerError, ServiceError, serviceTypes } from "./externals.ts";
import { Type } from "@sinclair/typebox";

export default class AuthController {
  private permissions: serviceTypes.IPermissions;
  private validator: serviceTypes.tValidator;

  constructor(
    validator: serviceTypes.tValidator,
    permissions: serviceTypes.IPermissions,
  ) {
    this.permissions = permissions;
    this.validator = validator;
  }

  async createAccount(
    email: string,
    password: string,
    accountType: string,
    role: string,
  ) {
    const argsSchema = Type.Object({
      email: this.validator.getSchema("email"),
      password: this.validator.getSchema("password"),
      roleTable: this.validator.getSchema("creatableRoles"),
      role: this.validator.getSchema("roles"),
    });
    const validArgs = this.validator.validate(argSc, { email, password, roleTable: accountType, role });

    if (validArgs !== true) {
      return new ControllerError(400, "Invalid arguments.");
    }

    const createUserPerm = this.permissions.isRolePermitted(
      role,
      "IPermissions",
      "createUser",
    );
    if (createUserPerm !== true) {
      return new ControllerError(401, "Unauthorized service access.");
    }

    return await this.permissions.createUser(email, password, accountType);
  }

  async login(email: string, password: string, roleType: string, role: string) {
    const validArgs = this.validator.validate({
      email: this.validator.getSchema("email"),
      password: this.validator.getSchema("password"),
      roleTable: this.validator.getSchema("roles"),
      role: this.validator.getSchema("roles"),
    }, { email, password, roleTable: roleType, role });

    if (validArgs !== true) {
      return new ControllerError(400, "Invalid arguments.");
    }

    switch (roleType) {
      // * visitor cannot log in.
      case "visitor": {
        return new ServiceError(
          400,
          "Invalid table.",
          "Internal Server Error.",
        );
      }

      case "root": {
        if (
          email === Deno.env.get("ROOT_USER") &&
          password === Deno.env.get("ROOT_PASS")
        ) {
          const sessionToken: Parameters<
            typeof this.permissions.encodeSession
          > = [
            { rootId: 0 },
            {
              iss: "FatStoreAdminApi",
              sub: "FatStore access.",
              expiresIn: "3d",
              jti: "0",
              aud: roleType,
            },
          ];
          const token = await this.permissions.encodeSession(...sessionToken);
          return { token };
        } else {
          return new ControllerError(401, "Invalid email and/or password.");
        }
      }
    }

    // * for other cases, check their tables
    const checkUserExistPerm = this.permissions.isRolePermitted(
      role,
      "IPermissions",
      "getUserByEmail",
    );
    if (checkUserExistPerm !== true) {
      return new ControllerError(401, "Unauthorized service access.");
    }

    const user = await this.permissions.getUserByEmail(email, roleType);
    if (user instanceof Error) {
      return user;
    }
    let id, savedPasswordHash;
    const idKey = `${roleType}Id`;
    if (Array.isArray(user) === false) {
      const userData = user as unknown as {
        email: string;
        password: string;
        [idKey: string]: string;
      };
      id = userData[idKey];
      savedPasswordHash = userData.password;
    } else {
      if (user.length < 1) {
        return new ControllerError(404, "No account found.");
      }
      const userData = user[0] as unknown as {
        email: string;
        password: string;
        [idKey: string]: string;
      };
      id = userData[idKey];
      savedPasswordHash = userData.password;
    }
    const passwordHash = await this.permissions.hashPassword(password);
    const isPasswordCorrect = passwordHash === savedPasswordHash;
    if (isPasswordCorrect === false) {
      return new ControllerError(401, "Password incorrect.");
    }

    const sessionToken: Parameters<typeof this.permissions.encodeSession> = [
      { [idKey]: id },
      {
        iss: "FatStoreAdminApi",
        sub: "FatStore access.",
        expiresIn: "3d",
        jti: id,
        aud: role,
      },
    ];
    const token = await this.permissions.encodeSession(...sessionToken);
    return { token };
  }
}
