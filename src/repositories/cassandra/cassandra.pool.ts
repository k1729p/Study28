import { Client } from 'cassandra-driver';

import { config } from "../../configuration/configuration.js";
/**
 * Configuration for the connection pool.
 */
const POOL_CONFIG = {
  contactPoints: [config.cassandraHost],
  localDataCenter: config.cassandraLocalDataCenter,
  socketOptions: {
    readTimeout: 30000,
    connectTimeout: 10000
  }
};
/**
 * Cassandra Client pool.
 * 
 * The DataStax driver handles connection pooling internally.
 */
const client = new Client(POOL_CONFIG);
/**
 * A promise that resolves to a connected client object.
 */
export const clientPromise = client.connect()
  .then(() => {
    console.log('Cassandra pool: connected and health-check passed');
    return client;
  })
  .catch(err => {
    console.error('Cassandra pool: database connection error', err);
    throw err;
  });
