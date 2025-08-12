declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: string;
            PGHOST: string;
            PGPORT: string;
            PGDATABASE: string;
            PGUSER: string;
            PGPASSWORD: string;
        }
    }
}
export { }
