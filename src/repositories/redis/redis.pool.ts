import { createClient } from 'redis';

import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
const POOL_CONFIG = {
    url: config.redisUrl
};
/**
 * Redis client.
 */
const client = createClient(POOL_CONFIG);

// Attaching the mandatory error listener.
// This prevents the app from crashing during runtime if Redis goes down.
client.on('error', (err) => console.error('Redis pool: runtime error', err));

/**
 * A promise that resolves to a connected client object.
 */
export const clientPromise = client.connect()
    .then(() => {
        console.log('Redis pool: connected to database');
        return client;
    })
    .catch(err => {
        console.error('Redis pool: initial connection error', err);
        throw err;
    });
