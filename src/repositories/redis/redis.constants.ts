import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
    url: `redis://${config.redisHost}:${config.redisPort}`,
};
