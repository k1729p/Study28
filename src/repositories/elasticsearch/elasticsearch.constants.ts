import { config } from "../../configuration/configuration.js";
/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
  node: `http://${config.elasticsearchHost}:${config.elasticsearchPort}`  
};
export const INDEX_DEPARTMENTS = 'departments';
export const INDEX_EMPLOYEES = 'employees';
