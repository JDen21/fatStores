import { assertExists } from "@std/assert";
import { validatorInstance, Type, email, password } from "./validatorsService.ts";
import { assertEquals } from "@std/assert/equals";
import { assertFalse } from "@std/assert/false";
import { appConfigs } from "./externals.ts";

Deno.test({
  name: "validator schemas exist",
  fn() {
    assertExists(validatorInstance.getSchema("email"), "email schema exist");
    assertExists(
      validatorInstance.getSchema("password"),
      "password schema exist",
    );
    assertExists(
      validatorInstance.getSchema("positiveNumber"),
      "positiveNumber schema exist",
    );
    assertExists(
      validatorInstance.getSchema("sqlStrId"),
      "sqlStrId schema exist",
    );
    assertExists(
      validatorInstance.getSchema("sqlName"),
      "sqlName schema exist",
    );
    assertExists(
      validatorInstance.getSchema("baseStr"),
      "baseStr schema exist",
    );
    assertExists(
      validatorInstance.getSchema("baseBool"),
      "baseBool schema exist",
    );
    assertExists(validatorInstance.getSchema("roles"), "roles schema exist");
  },
});

Deno.test({
  name: "email schema validates properly",
  fn() {
    const emailSchema = validatorInstance.getSchema("email");

    const validEmail = "Test123@email.com";
    const valid = emailSchema?.call(emailSchema, validEmail);
    assertEquals(valid, true, "validates good email structure");

    const invalidEmail = "Test.com";
    const invalid = emailSchema?.call(emailSchema, invalidEmail);
    assertEquals(invalid, false, "invalidates bad email structure");
  },
});

Deno.test({
  name: "password schema validates properly",
  fn() {
    const passwordSchema = validatorInstance.getSchema("password");

    const validPass = "TestPassword123";
    const valid = passwordSchema?.call(passwordSchema, validPass);
    assertEquals(valid, true, "validates good password structure");

    const numberLessPass = "TestPassword";
    let invalid = passwordSchema?.call(passwordSchema, numberLessPass);
    assertEquals(invalid, false, "invalidates password with no number");

    const capitalLessPass = "testpassword123";
    invalid = passwordSchema?.call(passwordSchema, capitalLessPass);
    assertEquals(invalid, false, "invalidates password with no capital letter");

    const tooSmallPass = "TestPas";
    invalid = passwordSchema?.call(passwordSchema, tooSmallPass);
    assertEquals(invalid, false, "invalidates password with too small length");
  },
});

Deno.test({
  name: "positiveNumber schema validates properly",
  fn() {
    const schema = validatorInstance.getSchema("positiveNumber");
    assertFalse(schema?.call(schema, -1));
    assertFalse(schema?.call(schema, 0));
    assertEquals(schema?.call(schema, 1), true);
  },
});

Deno.test({
  name: "sqlStrId validates properly",
  fn() {
    const schema = validatorInstance.getSchema("sqlStrId");
    const idLength = appConfigs.idLength;

    const validId = "x".repeat(idLength);
    const tooShort = "x".repeat(idLength - 1);
    const tooLong = "x".repeat(idLength + 1);

    assertEquals(
      schema?.call(schema, validId),
      true,
      "valid ID of correct length should pass",
    );
    assertFalse(
      schema?.call(schema, tooShort),
      "ID shorter than required should fail",
    );
    assertFalse(
      schema?.call(schema, tooLong),
      "ID longer than required should fail",
    );
  },
});

Deno.test({
  name: "sqlName validates properly",
  fn() {
    const schema = validatorInstance.getSchema("sqlName");
    const maxLength = appConfigs.nameLength;

    const validName = "Ali";
    const tooShort = "Ag";
    const tooLong = "x".repeat(maxLength + 1);

    assertEquals(
      schema?.call(schema, validName),
      true,
      "Valid user name should pass",
    );
    assertFalse(
      schema?.call(schema, tooShort),
      "User name shorter than minimum should fail",
    );
    assertFalse(
      schema?.call(schema, tooLong),
      "User name longer than maximum should fail",
    );
  },
});

Deno.test({
  name: "roles enum validates properly",
  fn() {
    const schema = validatorInstance.getSchema("roles");
    const designerRole = "designer";
    const sellerRole = "seller";
    const producerRole = "producer";
    const visitorRole = "visitor";
    const rootRole = "root";

    const invalidRole = "not_a_role";

    assertEquals(
      schema?.call(schema, designerRole),
      true,
      "designer role should pass",
    );
    assertEquals(
      schema?.call(schema, sellerRole),
      true,
      "seller role should pass",
    );
    assertEquals(
      schema?.call(schema, producerRole),
      true,
      "producer role should pass",
    );
    assertEquals(
      schema?.call(schema, visitorRole),
      true,
      "visitor role should pass",
    );
    assertEquals(schema?.call(schema, rootRole), true, "root role should pass");
    assertFalse(schema?.call(schema, invalidRole), "invalid role should fail");
  },
});

Deno.test({
  name: 'Can combine existing schema to form a new one.',
  fn () {
    const loginSchema =  Type.Object({
      email, password
    });
    const validAccount = {
      email: 'test@email.com',
      password: 'Pass@12314'
    };
    const invalidAccount = {
      email: 'tsx.com',
      password: 'pset'
    };

    assertEquals(validatorInstance.validate(loginSchema, validAccount), true);
    assertEquals(validatorInstance.validate(loginSchema, invalidAccount), false);
  }
});
