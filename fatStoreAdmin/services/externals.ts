export * as serviceTypes from "../services.d.ts";
export * as appConfigs from "../configs.ts";
export { CreatableRoles, Roles } from "../configs.ts";

export { safeAsync } from "../utils.ts";
export { default as ServiceError } from "../ServiceError.ts";
export type { possibleErrorTypes } from "../types.d.ts";

type methods = string;
type service = Record<string, methods[]>;
type role = string;
type permissionsList = Record<
  role,
  "*" | service | undefined
>;
import rp from "../rolePerms.default.json" with { type: "json" };
export const rolePermissions = rp as permissionsList;
