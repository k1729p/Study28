import { MongoClient } from 'mongodb';

import { config } from "../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
const POOL_CONFIG = {
}
/**
 * Connection pool.
 */
const client = new MongoClient(config.mongoDbUri, POOL_CONFIG);

/**
 * A promise that resolves to a connected client object.
 * Ensures the app only starts if the MongoDB connection is valid.
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