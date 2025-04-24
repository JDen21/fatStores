import type { possibleErrorTypes } from "./types.d.ts";

export default class ServiceError extends Error {
  devMessage: string = "";
  code: number = 0;
  rootError?: Error;
  private static defaultError = "Unknown error.";

  constructor(
    code: number = 0,
    externalServiceError: possibleErrorTypes,
    message: string,
  ) {
    super();
    this.message = message;
    this.code = code;

    // * assume external service error is not known
    if (externalServiceError === null) {
      this.devMessage = ServiceError.defaultError;
    }

    // * save error obj
    if (externalServiceError instanceof Error) {
      this.rootError = externalServiceError;
      this.devMessage = externalServiceError.message;
    }

    // * assume external service hints error code
    // * this code is sent as response status so
    // * only use if uncertain of proper error code.
    if (typeof externalServiceError === "number" && this.code === 0) {
      this.code = externalServiceError;
      this.devMessage = ServiceError.defaultError;
    }

    // * assumes external service error is a simple message
    if (typeof externalServiceError === "string") {
      this.devMessage = externalServiceError;
    }

    // * default to Bad Gateway if nothing is certain
    if (this.code === 0) {
      this.code = 502;
    }
  }
}
