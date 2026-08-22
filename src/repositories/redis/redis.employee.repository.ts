import { Employee } from "../../models/employee.js";
import { clientPromise } from "./redis.pool.js";
import { EmployeeRepository } from "../employee.repository.js";
import { buildEmployeeKey } from "./redis.mappers.js";
import * as constants from "./redis.constants.js";
/**
 * Repository class providing methods to manage employees.
 * Includes CRUD operations to create, read, update, and delete employees.
 */
export class RedisEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * 
   * @param employee - The employee to be created.
   * @returns A promise that resolves when the employee is created.
   */
  async createEmployee(employee: Employee): Promise<void> {
    const client = await clientPromise;
    try {
      await client.set(buildEmployeeKey(employee.id), JSON.stringify(employee));
      console.log("RedisEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
    } catch (err) {
      console.error("RedisEmployeeRepository.createEmployee():", err);
      throw err;
    }
  }
  /**
   * Retrieves all employees.
   * 
   * @returns A promise that resolves to an array of Employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    const client = await clientPromise;
    try {
      const employeeKeys = await client.keys(constants.EMPLOYEE_KEY_PATTERN);
      if (employeeKeys.length === 0) {
        console.log("RedisEmployeeRepository.getEmployees(): employees not found");
        return [];
      }
      const employeeStrings = await client.mGet(employeeKeys);
      const employees = employeeStrings
        .filter((employeeStr): employeeStr is string => !!employeeStr)
        .map(employeeStr => JSON.parse(employeeStr) as Employee)
        .sort((emp1, emp2) => emp1.id - emp2.id);
      console.log("RedisEmployeeRepository.getEmployees(): employees count[%d]", employees.length);
      return employees;
    } catch (err) {
      console.error("RedisEmployeeRepository.getEmployees():", err);
      throw err;
    }
  }
  /**
   * Retrieves an employee by their ID.
   * 
   * @param id - The ID of the employee to retrieve.
   * @returns A promise that resolves to the Employee object if found, otherwise undefined.
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const client = await clientPromise;
    try {
      const employeeJson = await client.get(buildEmployeeKey(id));
      if (!employeeJson) {
        console.log("RedisEmployeeRepository.getEmployee(): employee not found, employee id[%d]", id);
        return undefined;
      }
      console.log("RedisEmployeeRepository.getEmployee() employee id[%d]", id);
      return JSON.parse(employeeJson) as Employee;
    } catch (err) {
      console.error("RedisEmployeeRepository.getEmployee():", err);
      throw err;
    }
  }
  /**
   * Updates an existing employee, but only if it already exists.
   * 
   * @param employee - The employee object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateEmployee(employee: Employee): Promise<void> {
    const client = await clientPromise;
    try {
      const employeeKey = buildEmployeeKey(employee.id);
      const exists = await client.exists(employeeKey);
      if (!exists) {
        console.log("RedisEmployeeRepository.updateEmployee(): " +
          "employee not found, employee id[%d]", employee.id);
        return;
      }
      await client.set(employeeKey, JSON.stringify(employee));
    } catch (err) {
      console.error("RedisEmployeeRepository.updateEmployee():", err);
      throw err;
    }
    console.log("RedisEmployeeRepository.updateEmployee() employee id[%d]", employee.id);
  }
  /**
   * Deletes an employee by their ID.
   * 
   * @param id - The ID of the employee to be deleted.
   * @returns A promise that resolves when the employee is deleted.
   */
  async deleteEmployee(id: number): Promise<void> {
    const client = await clientPromise;
    try {
      await client.del(buildEmployeeKey(id));
    } catch (err) {
      console.error("RedisEmployeeRepository.deleteEmployee():", err);
      throw err;
    }
    console.log("RedisEmployeeRepository.deleteEmployee() employee id[%d]", id);
  }
}
