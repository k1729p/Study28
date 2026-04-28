import { Employee } from "../../models/employee.js";
import { EmployeeRepository } from "../employee.repository.js";
/**
 * This service class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 */
export class CassandraEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * @param employee the employee to be created
   * @return void
   */
  async createEmployee(employee: Employee): Promise<void>{
  }
  /**
   * Gets the employees.
   * @returns an array of Employee objects
   */
  async getEmployees(): Promise<Employee[]>{
    return [];
  }
  /**
   * Gets the employee by id.
   * @param id the id of the employee to retrieve
   * @returns the Employee object if found, otherwise undefined
   */
  async getEmployee(id: number): Promise<Employee | undefined>{
    return undefined;
  }
  /**
   * Updates an existing employee.
   * @param employee the employee to be updated
   * @returns void
   */
  async updateEmployee(employee: Employee): Promise<void>{
  }
  /**
   * Deletes a employee by its id.
   *
   * @param id the id of the employee to be deleted
   * @returns void
   */
  async deleteEmployee(id: number): Promise<void>{
  }
}