import {
  rolePermissions as rolePermData,
  ServiceError,
  serviceTypes,
} from "./externals.ts";
import { SqlConnection } from "./SqlConnection.ts";
import {
  createSigner,
  createVerifier,
  SignerOptions,
  SignerPayload,
} from "fast-jwt";
import { hash, Variant, verify } from "@felix/argon2";

export default class Permissions extends SqlConnection
  implements serviceTypes.IPermissions {
  private signingKey = Deno.env.get("JWT_KEY");

  async encodeSession(payload: SignerPayload, signerConfig: SignerOptions) {
    const sign = createSigner({
      algorithm: "HS512",
      ...signerConfig,
      key: () => Promise.resolve(this.signingKey),
    });
    return await sign(payload);
  }

  decodeSession(
    token: string,
    verifierOptions: serviceTypes.sessionVerOptions,
  ) {
    const verify = createVerifier({
      algorithms: ["HS512"],
      key: this.signingKey,
      ...verifierOptions,
    });
    return verify(token);
  }

  async hashPassword(password: string) {
    const salt = crypto.getRandomValues(
      new Uint8Array(Math.max(8, Math.random() * 32)),
    );
    const secret = new TextEncoder().encode(Deno.env.get("HASH_KEY"));
    const hashRounds = Deno.env.get("HASH_ROUNDS");
    const memoryCostMultip = Deno.env.get("HASH_TIME_COST");
    let timeCost, memoryCost;

    if (hashRounds) {
      timeCost = parseInt(hashRounds);
    }

    if (memoryCostMultip) {
      memoryCost = parseInt(memoryCostMultip) ** 16;
    }

    const options = {
      salt,
      secret,
      variant: Variant.Argon2id,
      timeCost,
      memoryCost,
    };
    return await hash(password, options);
  }

  verifyHashPass(hashPass: string, pass: string) {
    return verify(hashPass, pass);
  }

  isRolePermitted(
    role: string,
    controller: string,
    method: string,
  ) {
    const rolePermissions = rolePermData[role];

    if (rolePermissions === undefined) {
      return false;
    }

    if (rolePermissions === "*") {
      return true;
    }

    const controllerAcc = rolePermissions[controller];
    if (controllerAcc === undefined) {
      return false;
    }

    return controllerAcc.includes(method);
  }

  async getUserByEmail(email: string, table: string) {
    if (this.isValidRoleTable(table) === false) {
      const error = new Error(`Invalid table ${table}.`);
      return new ServiceError(400, error, "Server error.");
    }

    const query = `
      SELECT email, password, ${table}Id
      FROM ${table}
      WHERE email = ?`;
    const values = [email];
    return await this.generateQueryResponse(query, values);
  }

  async createUser(email: string, hashPass: string, table: string) {
    if (this.isValidRoleTable(table) === false) {
      const error = new Error(`Invalid table ${table}.`);
      return new ServiceError(400, error, "Server error.");
    }

    const query = `
      INSERT INTO ${table}(email, password)
      VALUES (?, ?)`;
    const values = [email, hashPass];
    return await this.generateQueryResponse(query, values);
  }

  async deleteUser(userId: string, table: string) {
    if (this.isValidRoleTable(table) === false) {
      const error = new Error(`Invalid table ${table}.`);
      return new ServiceError(400, error, "Server error.");
    }

    const query = `
      DELETE FROM ${table}
      WHERE ${table}Id=?`;
    const values = [userId];
    return await this.generateQueryResponse(query, values);
  }

  private isValidRoleTable(table: string) {
    switch (table) {
      case "designer":
      case "seller":
      case "producer": {
        return true;
      }
    }
    return false;
  }
}
