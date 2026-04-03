import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuration for connection pool.
 */
const POOL_CONFIG = {
    user: process.env.SQL_USER || 'sa',
    password: process.env.SQL_PASSWORD || 'ABab1234',
    server: process.env.SQL_SERVER || 'localhost',//sql-server
    database: process.env.SQL_DATABASE || 'master',
    port: parseInt(process.env.SQL_PORT || '1433'),
    options: {
        encrypt: false,
        trustServerCertificate: true, // Required for local self-signed certificates in Docker
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};
/**
 * A promise that resolves to a connected Pool object.
 * This pattern ensures that multiple repository calls share the same connection pool
 * and wait for the connection to be established.
 */
export const poolPromise = new sql.ConnectionPool(POOL_CONFIG)
    .connect()
    .then(pool => {
        console.log('SQLServer pool: connected to MS SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('SQLServer pool: database connection error', err);
        throw err;
    });