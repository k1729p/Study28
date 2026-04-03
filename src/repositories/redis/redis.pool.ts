import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuration for connection pool.
 */
const POOL_CONFIG = {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
};
/**
 * Redis client.
 */
const client = createClient(POOL_CONFIG);

// Attaching the mandatory error listener.
// This prevents the app from crashing during runtime if Redis goes down.
client.on('error', (err) => console.error('Redis pool: runtime error', err));

/**
 * A promise that resolves to a connected Redis Client.
 */
export const clientPromise = client.connect()
    .then(() => {
        console.log('Redis pool: connected to Redis Database');
        return client;
    })
    .catch(err => {
        console.error('Redis pool: initial connection error', err);
        throw err;
    });
