import neo4j from 'neo4j-driver';
import { CONNECTION_URI, AUTH_TOKEN, DRIVER_CONFIG } from "./neo4j.constants.js";
/**
 * The driver connection.
 */
const driver = neo4j.driver(CONNECTION_URI, AUTH_TOKEN, DRIVER_CONFIG);
/**
 * A promise that resolves to a connected Driver object.
 * Includes a simple retry to wait for the container to open the Bolt port.
 */
export const driverPromise = (async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await driver.getServerInfo();
      console.log('Neo4j pool: connected and health-check passed');
      return driver;
    } catch (err) {
      retries--;
      if (retries === 0) {
        console.error('Neo4j pool: database connection error after retries', err);
        throw err;
      }
      console.log(`Neo4j pool: waiting for database... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  return driver;
})();