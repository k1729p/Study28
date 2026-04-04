import { Pool } from "pg";

import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for connection pool.
 */
const POOL_CONFIG = {
    host: config.postgreSqlHost,
    port: config.postgreSqlPort,
    database: config.postgreSqlDatabase,
    user: config.postgreSqlUser,
    password: config.postgreSqlPassword,
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
        console.log('PostgreSQL pool: connected and health-check passed');
        // After validation release the test client immediately
        client.release();
        return pool;
    })
    .catch(err => {
        console.error('PostgreSQL pool: database connection error', err);
        throw err;
    });
