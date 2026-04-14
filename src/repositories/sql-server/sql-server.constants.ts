import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
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
