import { Connection, createConnection, FieldPacket, QueryResult } from "mysql2";

import { possibleErrorTypes, safeAsync, ServiceError } from "./externals.ts";

type tSqlString = string;

export const createDbCon = async () => {
  let connection: Connection;
  try {
    connection = await createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "root",
      database: "fatStore",
    });
    return connection;
  } catch (err) {
    console.log(err);
    const message = "SQL Server error: connection failed";
    throw new ServiceError(500, err as possibleErrorTypes, message);
  }
};

export class SqlConnection {
  private static connection = createDbCon();

  protected generateQueryResponse = async (
    sqlString: tSqlString,
    params: Array<unknown>,
  ) => {
    const connection = await SqlConnection.connection;
    const promise = connection.query(sqlString, params);
    const pResponse = await safeAsync(() => promise);
    let [error, response] = pResponse[Symbol.iterator]();
    error = error as possibleErrorTypes;

    if (error !== undefined && error !== null) {
      return new ServiceError(500, error, "SQL Server error: query failed.");
    }
    response = response as [QueryResult, FieldPacket[]];
    return response[0];
  };
}
