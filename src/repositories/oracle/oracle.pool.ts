import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Oracle returns rows as JSON objects (like Postgres and SQL Server) instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * Configuration for Oracle connection pool.
 * Default values are derived from oracle.yaml and Oracle 23ai Free defaults.
 */
const dbConfig = {
  user: process.env.ORACLE_USER || 'system',
  password: process.env.ORACLE_PASSWORD || 'ABab1234',
  connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/FREEPDB1',
  poolMin: 0,
  poolMax: 10,
  poolTimeout: 60
};

/**
 * A promise that resolves to a connected Pool object.
 */
export const poolPromise = oracledb.createPool(dbConfig)
  .then(pool => {
    console.log('Oracle pool: connected to Oracle Database');
    return pool;
  })
  .catch(err => {
    console.error('Oracle pool: database connection error', err);
    throw err;
  });