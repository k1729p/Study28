import sql from 'mssql';

import { POOL_CONFIG } from './sql-server.constants.js';
/**
 * A promise that resolves to a connected Pool object.
 * 
 * This pattern ensures that multiple repository calls share the same connection pool
 * and wait for the connection to be established.
 */
export const poolPromise = new sql.ConnectionPool(POOL_CONFIG)
  .connect()
  .then(pool => {
    console.log('SQL Server pool: connected and health-check passed');
    return pool;
  })
  .catch(err => {
    console.error('SQL Server pool: database connection error', err);
    throw err;
  });