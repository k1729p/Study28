import { ChromaClient } from 'chromadb';

import { CHROMA_CLIENT_CONFIG } from "./chroma.constants.js";
/**
 * Client instance.
 */
const client = new ChromaClient(CHROMA_CLIENT_CONFIG);
/**
 * A promise that resolves to a connected client object.
 */
export const clientPromise = client.heartbeat()
  .then(() => {
    console.log('Chroma client: connected and health-check passed');
    return client;
  })
  .catch(err => {
    console.error('Chroma client: database connection error', err);
    throw err;
  });
