import { Pool, PoolConfig } from "pg";
import { config } from "./../../configuration/configuration.js";

const POSTGRESQL_POOL_CONFIG: PoolConfig = {
    host: config.host,
    port: config.pgPort,
    database: config.pgDatabase,
    user: config.pgUser,
    password: config.pgPassword,
};
/**
 * PostgreSQL connection pool
 */
export const pool = new Pool(POSTGRESQL_POOL_CONFIG);