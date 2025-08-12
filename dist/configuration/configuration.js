import dotenv from 'dotenv';
dotenv.config({ quiet: true });
/**
 * Configuration object for the application.
 */
export const config = {
    port: Number(process.env.PORT),
    host: process.env.PGHOST || '',
    pgPort: Number(process.env.PGPORT),
    database: process.env.PGDATABASE || '',
    user: process.env.PGUSER || '',
    password: process.env.PGPASSWORD || '',
};
