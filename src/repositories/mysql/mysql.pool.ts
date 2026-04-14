import mysql from 'mysql2/promise';

import { POOL_CONFIG } from "./mysql.constants.js";
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
