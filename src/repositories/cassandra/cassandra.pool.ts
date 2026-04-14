import { Client } from 'cassandra-driver';
import { POOL_CONFIG } from "./cassandra.constants.js"
/**
 * Client.
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
