import dotenv from 'dotenv';

dotenv.config({ quiet: true });
/**
 * Configuration interface for the application.
 */
interface Config {
    port: number;
    host: string;
    pgPort: number;
    database: string;
    user: string;
    password: string;
}
/**
 * Configuration object for the application.
 */
export const config: Config = {
    port: Number(process.env.PORT),
    host: process.env.PGHOST || '',
    pgPort: Number(process.env.PGPORT),
    database: process.env.PGDATABASE || '',
    user: process.env.PGUSER || '',
    password: process.env.PGPASSWORD || '',
};
