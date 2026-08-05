import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import * as constants from "./chroma.constants.js";

/**
 * A flat, primitive-only record.
 * This is the shape Chroma requires for collection metadata
 * (string | number | boolean values only - no nested objects, arrays, or Date instances).
 */
type ChromaMetadata = Record<string, string | number | boolean>;

/**
 * Builds a small, deterministic placeholder embedding for a piece of text.
 * This keeps the repository free of any embedding-provider dependency
 * (no OpenAI/HuggingFace key, no downloaded model) which matches the tiny,
 * structured, non-semantic-search nature of this dataset.
 * The collections are created with `embeddingFunction: null`,
 * so Chroma requires callers to supply an embedding explicitly
 * on every add/upsert - this function is that supplier.
 * 
 * @param text the text to derive a vector from
 * @returns a fixed-length numeric vector
 */
export function toPlaceholderEmbedding(text: string): number[] {
  const vector = new Array(constants.EMBEDDING_DIMENSION).fill(0);
  for (let i = 0; i < text.length; i++) {
    vector[i % constants.EMBEDDING_DIMENSION] += text.charCodeAt(i);
  }
  return vector.map(value => value / 1000);
}

/**
 * Maps a Department to the metadata record stored in the "departments" collection.
 * Optional fields are omitted entirely (rather than set to null/undefined)
 * since Chroma metadata values must be string, number, or boolean.
 * 
 * @param department the department to convert
 * @returns the metadata record for the department
 */
export function toDepartmentMetadata(department: Department): ChromaMetadata {
  const metadata: ChromaMetadata = { name: department.name };
  if (department.startDate) {
    metadata.startDate = new Date(department.startDate).toISOString().split('T')[0];
  }
  if (department.endDate) {
    metadata.endDate = new Date(department.endDate).toISOString().split('T')[0];
  }
  if (department.notes) {
    metadata.notes = department.notes;
  }
  if (department.keywords && department.keywords.length > 0) {
    metadata.keywords = department.keywords.join(',');
  }
  if (department.image) {
    metadata.image = department.image;
  }
  return metadata;
}

/**
 * Maps an Employee to the metadata record stored in the "employees" collection.
 * `departmentId` is always included so employees can be grouped back under their department when reading.
 * 
 * @param employee the employee to convert
 * @returns the metadata record for the employee
 */
export function toEmployeeMetadata(employee: Employee): ChromaMetadata {
  const metadata: ChromaMetadata = {
    departmentId: employee.departmentId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    title: employee.title,
    phone: employee.phone,
    mail: employee.mail
  };
  if (employee.streetName) {
    metadata.streetName = employee.streetName;
  }
  if (employee.houseNumber) {
    metadata.houseNumber = employee.houseNumber;
  }
  if (employee.postalCode) {
    metadata.postalCode = employee.postalCode;
  }
  if (employee.locality) {
    metadata.locality = employee.locality;
  }
  if (employee.province) {
    metadata.province = employee.province;
  }
  if (employee.country) {
    metadata.country = employee.country;
  }
  return metadata;
}
