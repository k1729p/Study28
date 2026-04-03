import { Pool, PoolConfig } from "pg";

import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for connection pool.
 */
const POOL_CONFIG: PoolConfig = {
    host: config.host,
    port: config.pgPort,
    database: config.pgDatabase,
    user: config.pgUser,
    password: config.pgPassword,
};
/**
 * Connection pool.
 */
const pool = new Pool(POOL_CONFIG);
/**
 * A promise that resolves to a connected Pool object.
 */
export const poolPromise = pool.connect()
    .then(client => {
        console.log('PostgreSQL pool: connected to PostgreSQL Database');
        client.release(); // Release the test client
        return pool;
    })
    .catch(err => {
        console.error('PostgreSQL pool: database connection error', err);
        throw err;
    });
