import { RepositoryType } from '../repositories/repository-type.js';
import { Department } from '../models/department.js'
import { Employee } from '../models/employee.js'
import { Title } from '../models/title.js'

/**
 * Maps the string to the RepositoryType enumeration member.
 * @param value the value
 * @returns repositoryType
 */
export const toRepositoryType = (value?: any): RepositoryType => {
  const match = Object.values(RepositoryType).find(
    repositoryType => repositoryType.toLowerCase() === String(value).toLowerCase()
  );
  return match || RepositoryType.PostgreSQL;
};

/**
 * Maps an array from the response body to an array of Department.
 * @param body the response body, expected to be an array of department-like objects
 * @returns array of department
 */
export const bodyToDepartments = (body: any): Department[] => {
  return Array.isArray(body) ? body.map(bodyToDepartment) : [];
};

/**
 * Maps the response body to the Department.
 * @param body the response body
 * @returns department
 */
export const bodyToDepartment = (body: any): Department => {
  const parseDate = (val: any): Date | undefined => {
    if (!val) return undefined;
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date;
  };
  const department: Department = {
    id: Number(body.id),
    name: String(body.name || ''),
    startDate: parseDate(body.startDate),
    endDate: parseDate(body.endDate),
    notes: body.notes ? String(body.notes) : undefined,
    keywords: Array.isArray(body.keywords) ? body.keywords.map(String) : [],
    image: body.image ? String(body.image) : undefined,
    employees: Array.isArray(body.employees) ? body.employees.map(bodyToEmployee) : []
  };
  return department;
};

/**
 * Maps an array from the response body to an array of Employee.
 * @param body the response body, expected to be an array of employee-like objects
 * @returns array of employee
 */
export const bodyToEmployees = (body: any): Employee[] => {
  return Array.isArray(body) ? body.map(bodyToEmployee) : [];
};

/**
 * Maps the response body to the Employee.
 * @param body the response body
 * @returns employee
 */
export const bodyToEmployee = (body: any): Employee => {
  const employee: Employee = {
    id: Number(body.id),
    departmentId: Number(body.departmentId),
    firstName: String(body.firstName || ''),
    lastName: String(body.lastName || ''),
    title: body.title as Title,
    phone: String(body.phone || ''),
    mail: String(body.mail || ''),
    streetName: body.streetName ? String(body.streetName) : undefined,
    houseNumber: body.houseNumber ? String(body.houseNumber) : undefined,
    postalCode: body.postalCode ? String(body.postalCode) : undefined,
    locality: body.locality ? String(body.locality) : undefined,
    province: body.province ? String(body.province) : undefined,
    country: body.country ? String(body.country) : undefined,
  };
  return employee;
};