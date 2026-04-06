import { Client } from 'cassandra-driver';

import { config } from "../../configuration/configuration.js";

/**
 * Configuration for client.
 */
const CLIENT_CONFIG = {
    contactPoints: [config.cassandraHost],
    localDataCenter: config.cassandraLocalDataCenter,
    keyspace: 'study28'
};
/**
 * Cassandra Client pool.
 * The DataStax driver handles connection pooling internally.
 */
const client = new Client({
    contactPoints: CLIENT_CONFIG.contactPoints,
    localDataCenter: CLIENT_CONFIG.localDataCenter,
});
/**
 * A promise that resolves to a connected client object.
 */
export const clientPromise = client.connect()
    .then(() => {
        console.log('Cassandra client: connected and health-check passed');
        //client.keyspace = CLIENT_CONFIG.keyspace;
        return client;
    })
    .catch(err => {
        console.error('Cassandra client: database connection error', err);
        throw err;
    });