import oracledb from 'oracledb';

import { config } from "./../../configuration/configuration.js";

// Ensure Oracle returns rows as JSON objects (like Postgres and SQL Server) instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * Configuration for the connection pool.
 */
const POOL_CONFIG = {
  connectString: config.oracleConnectString,
  user: config.oracleUser,
  password: config.oraclePassword,
  poolMin: 0,
  poolMax: 10,
  poolTimeout: 60
};
/**
 * A promise that resolves to a connected Pool object.
 */
export const poolPromise = oracledb.createPool(POOL_CONFIG)
  .then(async (pool) => {
    const connection = await pool.getConnection();
    console.log('Oracle pool: connected and health-check passed');
    // After validation release the test connection immediately
    await connection.close();
    return pool;
  })
  .catch(err => {
    console.error('Oracle pool: database connection error', err);
    throw err;
  });