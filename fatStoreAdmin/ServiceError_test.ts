import { assertEquals, assertStrictEquals } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import ServiceError from "./ServiceError.ts";

const runSnapTest = Deno.args.includes("--snap") === false;

Deno.test({
  name: "ServiceError/UnknownNullError",
  fn: function () {
    const responseMessage = "Error response to request";
    const unknownErrorMes = "Unknown error.";

    const unknownNullError = new ServiceError(500, null, responseMessage);
    assertEquals(unknownNullError.code, 500, "should save error code");
    assertEquals(
      unknownNullError.devMessage,
      unknownErrorMes,
      "should save message to developer",
    );
    assertEquals(
      unknownNullError.message,
      responseMessage,
      "should save error response to request",
    );
  },
});

Deno.test({
  name: "ServiceError/InheritedError",
  fn: function () {
    const responseMessage = "Error response to request";
    const externalErrorDevMes = "Error from external";

    const externError = new Error(externalErrorDevMes);
    const inheritedError = new ServiceError(500, externError, responseMessage);
    assertEquals(inheritedError.code, 500, "should save error code");
    assertEquals(
      inheritedError.devMessage,
      externalErrorDevMes,
      "should save message to developer",
    );
    assertEquals(
      inheritedError.message,
      responseMessage,
      "should save error response to request",
    );
    assertStrictEquals(inheritedError.rootError, externError);
  },
});

Deno.test({
  name: "ServiceError/MessageError",
  fn: function () {
    const responseMessage = "Error response to request";
    const unknownErrorMes = "Unknown error.";

    // * keep message as log to developer but dont forward to response.
    const messageError = new ServiceError(
      500,
      unknownErrorMes,
      responseMessage,
    );
    assertEquals(messageError.code, 500, "should save error code");
    assertEquals(
      messageError.devMessage,
      unknownErrorMes,
      "should save message to developer",
    );
    assertEquals(
      messageError.message,
      responseMessage,
      "should save error response to request",
    );
  },
});

Deno.test({
  name: "ServiceError/CodeError",
  fn: function () {
    const responseMessage = "Error response to request";
    const unknownErrorMes = "Unknown error.";

    // * let the external service decide which error code to respond.
    const codeError = new ServiceError(0, 512, responseMessage);
    assertEquals(codeError.code, 512, "should save error code");
    assertEquals(
      codeError.devMessage,
      unknownErrorMes,
      "should save message to developer",
    );
    assertEquals(
      codeError.message,
      responseMessage,
      "should save error response to request",
    );
  },
});

Deno.test({
  name: "ServiceError/DefaultGatewayError",
  fn: function () {
    const responseMessage = "Error response to request";
    const unknownErrorMes = "Unknown error.";

    const defaultGatewayError = new ServiceError(
      0,
      unknownErrorMes,
      responseMessage,
    );
    assertEquals(defaultGatewayError.code, 502, "should save error code");
    assertEquals(
      defaultGatewayError.devMessage,
      unknownErrorMes,
      "should save message to developer",
    );
    assertEquals(
      defaultGatewayError.message,
      responseMessage,
      "should save error response to request",
    );
  },
});

Deno.test({
  name: "ServiceError snaps/UnknownNullError",
  ignore: runSnapTest,
  fn: async (t) => {
    const responseMessage = "Error response to request";
    const unknownNullError = new ServiceError(500, null, responseMessage);
    await assertSnapshot(t, JSON.stringify(unknownNullError));
  },
});

Deno.test({
  name: "ServiceError snaps/InheritedError",
  ignore: runSnapTest,
  fn: async (t) => {
    const externError = new Error("Error from external");
    const inheritedError = new ServiceError(
      500,
      externError,
      "Error response to request",
    );
    await assertSnapshot(t, JSON.stringify(inheritedError));
  },
});

Deno.test({
  name: "ServiceError snaps/MessageError",
  ignore: runSnapTest,
  fn: async (t) => {
    const messageError = new ServiceError(
      500,
      "Unknown error.",
      "Error response to request",
    );
    await assertSnapshot(t, JSON.stringify(messageError));
  },
});

Deno.test({
  name: "ServiceError snaps/CodeError",
  ignore: runSnapTest,
  fn: async (t) => {
    const responseMessage = "Error response to request";

    // * let the external service decide which error code to respond.
    const codeError = new ServiceError(0, 512, responseMessage);
    await assertSnapshot(t, JSON.stringify(codeError));
  },
});

Deno.test({
  name: "ServiceError snaps/DefaultGatewayError",
  ignore: runSnapTest,
  fn: async (t) => {
    const responseMessage = "Error response to request";
    const unknownErrorMes = "Unknown error.";

    const defaultGatewayError = new ServiceError(
      0,
      unknownErrorMes,
      responseMessage,
    );
    await assertSnapshot(t, JSON.stringify(defaultGatewayError));
  },
});
