import { Employee } from "../models/employee.js";
/**
 * This service interface provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 */
export interface EmployeeRepository {
  /**
   * Creates a new employee.
   * @param employee the employee to be created
   * @return void
   */
  createEmployee(employee: Employee): Promise<void>;
  /**
   * Gets the employees.
   * @returns an array of Employee objects
   */
  getEmployees(): Promise<Employee[]>;
  /**
   * Gets the employee by id.
   * @param id the id of the employee to retrieve
   * @returns the Employee object if found, otherwise undefined
   */
  getEmployee(id: number): Promise<Employee | undefined>;
  /**
   * Updates an existing employee.
   * @param employee the employee to be updated
   * @returns void
   */
  updateEmployee(employee: Employee): Promise<void>;
  /**
   * Deletes a employee by its id.
   *
   * @param id the id of the employee to be deleted
   * @returns void
   */
  deleteEmployee(id: number): Promise<void>;
}
