import { Department } from "../models/department.js";
import { Employee } from "../models/employee.js";
/**
 * Maps a raw database row (snake_case columns) to a Department object (camelCase properties).
 * Handles both a MySQL-style comma-joined keywords string and a PostgreSQL-style keywords array.
 * If the row also contains employee columns (employee_id present), the first employee is
 * included in the returned department's employees array.
 * @param row the raw database row
 * @returns the mapped Department object
 */
export const mapDatabaseRowToDepartment = (row: any): Department => {
  const department: Department = {
    id: row.id,
    name: row.name,
    startDate: row.start_date ? new Date(row.start_date) : undefined,
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    notes: row.notes,
    keywords: row.keywords
      ? (Array.isArray(row.keywords) ? row.keywords : row.keywords.split(','))
      : [],
    image: row.image,
    employees: []
  };
  if (row.employee_id) {
    department.employees.push(mapDatabaseRowToEmployee(row, false));
  }
  return department;
};
/**
 * Maps a raw database row (snake_case columns) to an Employee object (camelCase properties).
 * @param row the raw database row
 * @param flag the flag for a field name of the employee id
 * @returns the mapped Employee object
 */
export const mapDatabaseRowToEmployee = (row: any, flag: boolean): Employee => {
  return {
    id: flag ? row.id : row.employee_id,
    departmentId: row.department_id,
    firstName: row.first_name,
    lastName: row.last_name,
    title: row.title,
    phone: row.phone,
    mail: row.mail,
    streetName: row.street_name,
    houseNumber: row.house_number,
    postalCode: row.postal_code,
    locality: row.locality,
    province: row.province,
    country: row.country
  };
};
