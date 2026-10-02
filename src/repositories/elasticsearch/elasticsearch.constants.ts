import { config } from "../../configuration/configuration.js";
/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
  node: `http://${config.elasticsearchHost}:${config.elasticsearchPort}`
};
// --- indices -------------------------------------------------------------------------------------
export const INDEX_DEPARTMENTS = 'departments';
export const INDEX_EMPLOYEES = 'employees';
/**
 * Upper bound used for non-paginated 'search' requests.
 * Elasticsearch's own safety net, 'index.max_result_window', defaults to 10 000.
 */
export const MAX_RESULTS = 1000;
