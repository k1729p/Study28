import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const POOL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'kp',
  password: process.env.MYSQL_PASSWORD || 'mikimiki',
  database: process.env.MYSQL_DATABASE || 'kp_database',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

// Create the pool instance
const pool = mysql.createPool(POOL_CONFIG);

/**
 * A promise that resolves to the validated MySQL Pool.
 */
export const poolPromise = pool.getConnection()
  .then(connection => {
    console.log('MySQL pool: connected to MySQL Database');
    // After validation release the test connection immediately
    connection.release();
    return pool;
  })
  .catch(err => {
    console.error('MySQL pool: database connection error', err);
    throw err;
  });
