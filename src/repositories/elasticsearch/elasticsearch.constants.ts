import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { config } from "../../configuration/configuration.js";
/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
  node: `http://${config.elasticsearchHost}:${config.elasticsearchPort}`
};
// --- indices -------------------------------------------------------------------------------------
export const INDEX_DEPARTMENTS = 'departments';
export const INDEX_EMPLOYEES = 'employees';
/**
 * Upper bound used for non-paginated 'search' requests.
 * Elasticsearch's own safety net, 'index.max_result_window', defaults to 10 000.
 */
export const MAX_RESULTS = 1000;
// --- mappers -------------------------------------------------------------------------------------
export const DEPARTMENT_TO_DOCUMENT = (department: Department): any => {
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
export const EMPLOYEE_TO_DOCUMENT = (employee: Employee): any => {
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
export const SOURCE_TO_DEPARTMENT = (source: any): Department => {
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
export const SOURCE_TO_EMPLOYEE = (source: any): Employee => {
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
