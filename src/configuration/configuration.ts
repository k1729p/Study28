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
    host: String(process.env.PGHOST),
    pgPort: Number(process.env.PGPORT),
    database: String(process.env.PGDATABASE),
    user: String(process.env.PGUSER),
    password: String(process.env.PGPASSWORD),
};
