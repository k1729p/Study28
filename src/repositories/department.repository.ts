import { Department } from "../models/department.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export interface DepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  createDepartment(department: Department): Promise<void>;
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  getDepartments(): Promise<Department[]>;
  /**
   * Gets the department by id.
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  getDepartment(id: number): Promise<Department | undefined>;
  /**
   * Updates an existing department.
   * @param department the department to be updated
   * @returns void
   */
  updateDepartment(department: Department): Promise<void>;
  /**
   * Deletes a department by its id.
   *
   * @param id the id of the department to be deleted
   * @returns void
   */
  deleteDepartment(id: number): Promise<void>;
  /**
   * Transfers the employees from source department to target department.
   * 
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the transferred employees array
   * @returns void
   */
  transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void>;
}
