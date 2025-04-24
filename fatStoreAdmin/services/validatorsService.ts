import Ajv, { type Plugin } from "ajv";
import ajvFormats, { type FormatsPluginOptions } from "ajv-formats";
import { Type } from "@sinclair/typebox";
import { appConfigs, CreatableRoles, Roles } from "./externals.ts";

export const validatorInstance = new Ajv.default({
  validateSchema: "log",
  coerceTypes: true,
});

const addFormats = ajvFormats as unknown as Plugin<FormatsPluginOptions>;
addFormats(validatorInstance, { formats: ["email"] });

export const email = Type.String({ format: "email" });
validatorInstance.addSchema(email, "email");

const passwordFormat = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$";
export const password = Type.String({ pattern: passwordFormat });
validatorInstance.addSchema(password, "password");

export const positiveNumber = Type.Number({ minimum: 1 });
validatorInstance.addSchema(positiveNumber, "positiveNumber");

export const sqlStrId = Type.String({
  minLength: appConfigs.idLength,
  maxLength: appConfigs.idLength,
});
validatorInstance.addSchema(sqlStrId, "sqlStrId");

export const sqlName = Type.String({
  minLength: 3,
  maxLength: appConfigs.nameLength,
});
validatorInstance.addSchema(sqlName, "sqlName");

export const baseStr = Type.String();
validatorInstance.addSchema(baseStr, "baseStr");

export const baseBoolean = Type.Boolean();
validatorInstance.addSchema(baseBoolean, "baseBool");

export const roleTable = Type.Enum(Roles);
validatorInstance.addSchema(roleTable, "roles");

export const creatableRoleTable = Type.Enum(CreatableRoles);
validatorInstance.addSchema(creatableRoleTable, "creatableRoles");

export type tValidator = Ajv.Ajv;
export { Type };
