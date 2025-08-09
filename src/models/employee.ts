import { Title } from './title.js';
/**
 * Represents an employee in the system.
 * This interface defines the structure of an employee object,
 * including its unique identifier, name, title, contact information,
 * and address details.
 *
 * @interface Employee
 * @property {number} id - The unique identifier for the employee.
 * @property {string} firstName - The first name of the employee.
 * @property {string} lastName - The last name of the employee.
 * @property {Title} title - The title of the employee, represented by the Title interface.
 * @property {string} phone - The phone number of the employee.
 * @property {string} mail - The email address of the employee.
 * @property {string} [streetName] - The street name of the employee's address (optional).
 * @property {string} [houseNumber] - The house number of the employee's address (optional).
 * @property {string} [postalCode] - The postal code of the employee's address (optional).
 * @property {string} [locality] - The locality of the employee's address (optional).
 * @property {string} [province] - The province of the employee's address (optional).
 * @property {string} [country] - The country of the employee's address (optional).
 */
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  title: Title;
  phone: string;
  mail: string;
  streetName?: string;
  houseNumber?: string;
  postalCode?: string;
  locality?: string;
  province?: string;
  country?: string;
}
