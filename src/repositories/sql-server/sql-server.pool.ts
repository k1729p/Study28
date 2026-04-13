import sql from 'mssql';

import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
const POOL_CONFIG = {
    server: config.sqlServerHost,
    port: config.sqlServerPort,
    database: config.sqlServerDatabase,
    user: config.sqlServerUser,
    password: config.sqlServerPassword,
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