import dotenv from 'dotenv';

dotenv.config({ quiet: true });
/**
 * Configuration interface for the application.
 */
interface Config {
    port: number;
    host: string;
    pgPort: number;
    pgDatabase: string;
    pgUser: string;
    pgPassword: string;
    mongoDbUri: string;
    mongoDbDatabase: string;
}
/**
 * Configuration object for the application.
 */
export const config: Config = {
    port: Number(process.env.PORT),
    host: String(process.env.PGHOST),
    pgPort: Number(process.env.PGPORT),
    pgDatabase: String(process.env.PGDATABASE),
    pgUser: String(process.env.PGUSER),
    pgPassword: String(process.env.PGPASSWORD),
    mongoDbUri: String(process.env.MONGODBURI),
    mongoDbDatabase: String(process.env.MONGODBDATABASE),
};
