import { Pool } from "pg";
import { RepositoryException } from "../repository-exception.js";
import { POOL_CONFIG } from "./postgresql.constants.js";
/**
 * Connection pool instance.
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
        throw new RepositoryException(
            `Failed to connect to PostgreSQL pool`,
            { cause: err, operation: 'poolConnect' }
        );
    });
