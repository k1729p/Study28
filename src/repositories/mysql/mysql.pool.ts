import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
/**
 * MySQL connection pool configuration.
 */
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'kp',
  password: process.env.MYSQL_PASSWORD || 'mikimiki',
  database: process.env.MYSQL_DATABASE || 'kp_database',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});