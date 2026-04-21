import neo4j, { AuthToken, Config } from 'neo4j-driver';

import { config } from "./../../configuration/configuration.js";
/**
 * The database connection URI.
 * <SCHEME>://<HOST>:<PORT>
 */
export const CONNECTION_URI = `bolt://${config.neo4jHost}:${config.neo4jPort}`;
/**
 * The authorization token using basic authentication scheme.
 */
export const AUTH_TOKEN: AuthToken = neo4j.auth.basic(config.neo4jUser, config.neo4jPassword);
/**
 * Configuration for the driver.
 */
export const DRIVER_CONFIG: Config = {
  encrypted: 'ENCRYPTION_OFF',
  trust: 'TRUST_ALL_CERTIFICATES'
};
