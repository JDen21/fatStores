import { QueryResult } from "mysql2";
import ServiceError from "./ServiceError.ts";
import Ajv from "ajv";
import {
  Bufferable,
  SignerOptions,
  SignerPayload,
  VerifierOptions,
} from "fast-jwt";

export type sessionVerOptions = Partial<
  VerifierOptions & {
    key: Bufferable;
  }
>;

export type tValidator = Ajv.Ajv;
export type dbResult = Promise<ServiceError | QueryResult>;

export interface IProductQuery {
  name: string;
  createNewDesign: (
    designId: string,
    productId: string,
    designerId: string,
    name: string,
    description: string,
    price: number,
    maxSeller: number,
  ) => dbResult;
  getProductsDisplay: (offset: number) => dbResult;
  requestNewProducer: (designId: string) => dbResult;
  updateDesignSaleDetails: (
    designId: string,
    name: string,
    description: string,
    price: number,
    maxSeller: number,
  ) => dbResult;
  updateDesignSaleStatus: (designId: string, onSale: boolean) => dbResult;
}

// * session and permission services
export interface IPermissions {
  encodeSession: (
    payload: SignerPayload,
    signerConfig: SignerOptions,
  ) => Promise<string>;
  decodeSession: (token: string, verifierOptions: sessionVerOptions) => unknown;
  hashPassword: (password: string) => Promise<string>;
  verifyHashPass: (savedHashPass: string, password: string) => Promise<boolean>;
  isRolePermitted: (role: string, service: string, method: string) => boolean;
  getUserByEmail: (email: string, table: string) => dbResult;
  createUser: (email: string, hashPass: string, table: string) => dbResult;
  deleteUser: (userId: string, table: string) => dbResult;
}
