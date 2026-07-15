import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the client.
 */
export const CHROMA_CLIENT_CONFIG = {
  host: config.chromaHost,
  port: config.chromaPort,
  ssl: false
};
/**
 * Name of the Chroma collection that stores one record per department.
 */
export const DEPARTMENTS_COLLECTION = 'departments';
/**
 * Name of the Chroma collection that stores one record per employee.
 */
export const EMPLOYEES_COLLECTION = 'employees';
/**
 * Dimensionality of the placeholder vectors produced by {@link toPlaceholderEmbedding}.
 * Kept tiny on purpose: this application only ever fetches records by id or by
 * a metadata filter (department id), never by nearest-neighbour similarity, so
 * the vector content is irrelevant - Chroma just needs *some* fixed-length
 * embedding to store alongside each record.
 */
export const EMBEDDING_DIMENSION = 8;