import { Pool } from "pg";
const POSTGRESQL_POOL_CONFIG = {
    user: "postgres",
    password: "mikimiki",
    database: "postgres",
    host: "localhost",
    port: 5432,
};
export const pool = new Pool(POSTGRESQL_POOL_CONFIG);
