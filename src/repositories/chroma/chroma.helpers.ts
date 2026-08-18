import type { Metadata } from "chromadb";

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { Title } from "../../models/title.js";
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
    metadata.keywords = department.keywords.join(constants.KEYWORDS_SEPARATOR);
  }
  if (department.image) {
    metadata.image = department.image;
  }
  return metadata;
}
/**
 * Maps an Employee to the metadata record stored in the "employees" collection.
 * Optional fields are omitted entirely (rather than set to null/undefined)
 * since Chroma metadata values must be string, number, or boolean.
 * The field `departmentId` is always included so employees
 * can be grouped back under their department when reading.
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
/**
 * Maps a Chroma record (id + metadata) read from the "departments" collection
 * back into a Department object.
 * The returned department's `employees` array is always empty, so callers that need
 * a populated `employees` array must attach them separately.
 *
 * @param id the Chroma record id, i.e. the department id, stored as a string
 * @param metadata the metadata record read back from the "departments" collection
 * @returns the reconstructed Department object
 */
export function toDepartment(id: string, metadata: Metadata | null | undefined): Department {
  const meta = metadata ?? {};
  return {
    id: Number(id),
    name: String(meta.name ?? ''),
    startDate: meta.startDate ? new Date(String(meta.startDate)) : undefined,
    endDate: meta.endDate ? new Date(String(meta.endDate)) : undefined,
    notes: meta.notes ? String(meta.notes) : undefined,
    keywords: meta.keywords ? String(meta.keywords).split(constants.KEYWORDS_SEPARATOR) : [],
    image: meta.image ? String(meta.image) : undefined,
    employees: []
  };
}
/**
 * Maps a Chroma record (id + metadata) read from the "employees" collection
 * back into an Employee object.
 *
 * @param id the Chroma record id, i.e. the employee id, stored as a string
 * @param metadata the metadata record read back from the "employees" collection
 * @returns the reconstructed Employee object
 */
export function toEmployee(id: string, metadata: Metadata | null | undefined): Employee {
  const meta = metadata ?? {};
  return {
    id: Number(id),
    departmentId: Number(meta[constants.DEPARTMENT_ID_FIELD]),
    firstName: String(meta.firstName ?? ''),
    lastName: String(meta.lastName ?? ''),
    title: meta.title as Title,
    phone: String(meta.phone ?? ''),
    mail: String(meta.mail ?? ''),
    streetName: meta.streetName ? String(meta.streetName) : undefined,
    houseNumber: meta.houseNumber ? String(meta.houseNumber) : undefined,
    postalCode: meta.postalCode ? String(meta.postalCode) : undefined,
    locality: meta.locality ? String(meta.locality) : undefined,
    province: meta.province ? String(meta.province) : undefined,
    country: meta.country ? String(meta.country) : undefined
  };
}
