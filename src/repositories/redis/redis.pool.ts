import { createClient } from 'redis';

import { RepositoryException } from "../repository-exception.js";
import { POOL_CONFIG } from './redis.constants.js';
/**
 * Client instance.
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
    throw new RepositoryException(
      `Failed to connect to Redis pool`,
      { cause: err, operation: 'poolConnect' }
    );
  });
