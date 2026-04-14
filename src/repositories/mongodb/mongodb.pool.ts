import { MongoClient } from 'mongodb';

import { MONGODB_URI } from "./mongodb.constants.js";
/**
 * Client.
 */
const client = new MongoClient(MONGODB_URI);
/**
 * A promise that resolves to a connected client object.
 */
export const poolPromise = client.connect()
  .then(connectedClient => {
    console.log('MongoDB pool: connected and health-check passed');
    return connectedClient;
  })
  .catch(err => {
    console.error('MongoDB pool: database connection error', err);
    throw err;
  });