import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";

export const departmentToDocument = (department: Department): any => {
  return {
    id: department.id,
    name: department.name,
    startDate: department.startDate,
    endDate: department.endDate,
    notes: department.notes,
    keywords: department.keywords || [],
    image: department.image
  };
};
export const employeeToDocument = (employee: Employee): any => {
  return {
    id: employee.id,
    departmentId: employee.departmentId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    title: employee.title,
    phone: employee.phone,
    mail: employee.mail,
    streetName: employee.streetName,
    houseNumber: employee.houseNumber,
    postalCode: employee.postalCode,
    locality: employee.locality,
    province: employee.province,
    country: employee.country
  };
};
// Maps a raw Elasticsearch department document source into a Department object.
// Field 'employees' is initialised empty since it is not persisted on the department document itself.
export const sourceToDepartment = (source: any): Department => {
  return {
    id: source.id,
    name: source.name,
    startDate: source.startDate ? new Date(source.startDate) : undefined,
    endDate: source.endDate ? new Date(source.endDate) : undefined,
    notes: source.notes,
    keywords: source.keywords ?? [],
    image: source.image,
    employees: []
  };
};
// Maps a raw Elasticsearch employee document source into an Employee object.
export const sourceToEmployee = (source: any): Employee => {
  return {
    id: source.id,
    departmentId: source.departmentId,
    firstName: source.firstName,
    lastName: source.lastName,
    title: source.title,
    phone: source.phone,
    mail: source.mail,
    streetName: source.streetName,
    houseNumber: source.houseNumber,
    postalCode: source.postalCode,
    locality: source.locality,
    province: source.province,
    country: source.country
  };
};
