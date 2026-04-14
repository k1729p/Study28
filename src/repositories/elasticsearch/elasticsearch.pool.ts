import { Client } from '@elastic/elasticsearch';

import { POOL_CONFIG } from "./elasticsearch.constants.js";
/**
 * Client.
 * 
 * The official Node.js client automatically manages connection pooling.
 */
const client = new Client(POOL_CONFIG);
/**
 * A promise that resolves to a connected client object.
 */
export const clientPromise = client.ping()
  .then(response => {
    if (response) {
      console.log('Elasticsearch pool: connected and health-check passed');
    }
    return client;
  })
  .catch(err => {
    console.error('Elasticsearch pool: database connection error', err);
    throw err;
  });