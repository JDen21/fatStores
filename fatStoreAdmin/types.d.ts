// export type fullHttpError =  { message: string, code: number };
export type possibleErrorTypes = null | Error | string | number;

export type validatorName = string;
export type param = unknown;
export type paramErrorName = string;

export type iterCheck = [validatorName, param, paramErrorName];
