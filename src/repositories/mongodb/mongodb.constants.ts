import { config } from "../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
export const MONGODB_URI = `mongodb://${config.mongoDbUser}:${config.mongoDbPassword}@` +
  `${config.mongoDbHost}:${config.mongoDbPort}/?authSource=${config.mongoDbUser}`;
