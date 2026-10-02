import { Employee } from './employee.js';
/**
 * Represents a department within the organization.
 * This interface defines the structure of a department object,
 * including its unique identifier, name, establishment and closure dates,
 * optional notes, and associated keywords.
 *
 * @interface Department
 * @property {number} id - The unique identifier for the department.
 * @property {string} name - The name of the department.
 * @property {Employee[]} employees - The employees belonging to the department.
 * @property {Date} [startDate] - The date when the department was established.
 * @property {Date} [endDate] - The date when the department was closed or will be closed.
 * @property {string} [notes] - Additional notes about the department.
 * @property {string[]} [keywords] - Keywords associated with the department.
 * @property {string} image - The URL of the department's image.
 */
export interface Department {
  id: number;
  name: string;
  employees: Employee[];
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  keywords?: string[];
  image?: string;
}
