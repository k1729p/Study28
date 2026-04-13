import mysql from 'mysql2/promise';

import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
const POOL_CONFIG = {
  host: config.mySqlHost,
  port: config.mySqlPort,
  database: config.mySqlDatabase,
  user: config.mySqlUser,
  password: config.mySqlPassword,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};
/**
 * Connection pool.
 */
const pool = mysql.createPool(POOL_CONFIG);
/**
 * A promise that resolves to a connected Pool object.
 */
export const poolPromise = pool.getConnection()
  .then(connection => {
    console.log('MySQL pool: connected and health-check passed');
    // After validation release the test connection immediately
    connection.release();
    return pool;
  })
  .catch(err => {
    console.error('MySQL pool: database connection error', err);
    throw err;
  });
