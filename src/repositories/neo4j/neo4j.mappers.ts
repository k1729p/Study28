import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";

export const parametersForDepartment = (department: Department): any => {
  return {
    id: department.id,
    name: department.name,
    startDate: department.startDate?.toISOString() || null,
    endDate: department.endDate?.toISOString() || null,
    notes: department.notes || null,
    keywords: department.keywords ? department.keywords.join(',') : null,
    image: department.image || null
  };
}
export const parametersForEmployee = (employee: Employee): any => {
  return {
    id: employee.id,
    departmentId: employee.departmentId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    title: employee.title,
    phone: employee.phone,
    mail: employee.mail,
    streetName: employee.streetName || null,
    houseNumber: employee.houseNumber || null,
    postalCode: employee.postalCode || null,
    locality: employee.locality || null,
    province: employee.province || null,
    country: employee.country || null
  };
}
/**
 * Converts a Neo4j Integer (or a plain JS number) node property into a native JS number.
 * Numeric node properties may come back from the driver as a lossless Integer object
 * (with a 'toNumber' method) or, depending on how they were originally stored, as a
 * plain JS number; this helper copes with either representation.
 * @param value the raw numeric property value returned by the driver
 * @returns the value as a native JS number
 */
const toJsNumber = (value: any): number => {
  return value && typeof value.toNumber === 'function' ? value.toNumber() : Number(value);
}
/**
 * Maps a query record produced by READ_DEPARTMENTS_QUERY / READ_DEPARTMENT_QUERY
 * (columns 'department' and 'employees') to a Department object, including its
 * associated Employees.
 * @param record the Neo4j query record
 * @returns the mapped Department object
 */
export const recordToDepartment = (record: any): Department => {
  const departmentNode = record.get('department');
  const properties = departmentNode.properties;
  const department: Department = {
    id: toJsNumber(properties.id),
    name: properties.name,
    startDate: properties.startDate,
    endDate: properties.endDate,
    notes: properties.notes,
    keywords: properties.keywords ? properties.keywords.split(',') : [],
    image: properties.image,
    employees: []
  };
  const employeeNodes = record.get('employees');
  if (employeeNodes && employeeNodes.length > 0) {
    department.employees = employeeNodes
      .filter((node: any) => node !== null) // filters out nulls from an empty OPTIONAL MATCH collection
      .map((node: any) => nodeToEmployee(node));
  }
  return department;
}
/**
 * Maps a plain Employee node (as returned by 'RETURN employee') to an Employee object.
 * @param employeeNode the Neo4j node for the Employee
 * @returns the mapped Employee object
 */
export const nodeToEmployee = (employeeNode: any): Employee => {
  const properties = employeeNode.properties;
  return {
    id: toJsNumber(properties.id),
    departmentId: toJsNumber(properties.departmentId),
    firstName: properties.firstName,
    lastName: properties.lastName,
    title: properties.title,
    phone: properties.phone,
    mail: properties.mail,
    streetName: properties.streetName,
    houseNumber: properties.houseNumber,
    postalCode: properties.postalCode,
    locality: properties.locality,
    province: properties.province,
    country: properties.country
  };
}
