import { Pool } from "pg";
import { config } from "./../../configuration/configuration.js";
const POSTGRESQL_POOL_CONFIG = {
    host: config.host,
    port: config.pgPort,
    database: config.database,
    user: config.user,
    password: config.password,
};
/**
 * PostgreSQL connection pool
 */
export const pool = new Pool(POSTGRESQL_POOL_CONFIG);
