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
// --- Metadata field names ----------------------------------------------------------------------
/**
 * Metadata field name, on an employee record, that stores the id of the department the
 * employee currently belongs to. Used to build `where` filters when fetching, deleting, or
 * transferring the employees "of a department" - the closest Chroma equivalent of a SQL
 * foreign-key column.
 */
export const DEPARTMENT_ID_FIELD = 'departmentId';
/**
 * Separator used to join a department's `keywords` array into the single string value that
 * Chroma metadata requires (metadata values must be string | number | boolean, never an array),
 * and to split it back into an array when a department is read back.
 */
export const KEYWORDS_SEPARATOR = ',';