import ControllerError from "../ControllerError.ts";
import ServiceError from "../ServiceError.ts";
import { Response } from "oak";
import { ResponseBody } from "oak-response";

export const generateResponse = <T>(res: Response, value: T) => {
  if (value instanceof ServiceError) {
    res.body = { message: value.message };
    res.status = value.code;
    console.error(value.devMessage);
  } else if (value instanceof ControllerError) {
    res.body = { message: value.message };
    res.status = value.code;
  } else {
    res.body = value as ResponseBody;
  }
};
