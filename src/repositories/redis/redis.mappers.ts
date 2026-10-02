import { Department } from "../../models/department.js";
import { DEPARTMENT_KEY_PREFIX, EMPLOYEE_KEY_PREFIX } from "./redis.constants.js";
/**
 * Builds the Redis key for a department record.
 *
 * @param id - the department id
 * @returns the Redis key, e.g. `department:7`
 */
export const buildDepartmentKey = (id: number): string => `${DEPARTMENT_KEY_PREFIX}${id}`;
/**
 * Builds the Redis key for an employee record.
 *
 * @param id - the employee id
 * @returns the Redis key, e.g. `employee:42`
 */
export const buildEmployeeKey = (id: number): string => `${EMPLOYEE_KEY_PREFIX}${id}`;
/**
 * Parses a raw `department:{id}` JSON string into a Department object,
 * reviving `startDate` and `endDate` into Date instances and initializing
 * an empty `employees` array to be populated separately by the caller if needed.
 *
 * @param departmentJson - the raw JSON string read from Redis
 * @returns the parsed Department object
 */
export const recordToDepartment = (departmentJson: string): Department => {
  const department = JSON.parse(departmentJson);
  return {
    ...department,
    startDate: department.startDate ? new Date(department.startDate) : undefined,
    endDate: department.endDate ? new Date(department.endDate) : undefined,
    employees: []
  };
}
