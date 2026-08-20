import { Department } from "../models/department.js";
/**
 * Repository interface providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export interface DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  createDepartment(department: Department): Promise<void>;

  /**
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  getDepartments(): Promise<Department[]>;

  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  getDepartment(id: number): Promise<Department | undefined>;

  /**
   * Updates an existing department.
   * 
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  updateDepartment(department: Department): Promise<void>;

  /**
   * Deletes a department by its ID.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  deleteDepartment(id: number): Promise<void>;

  /**
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  transferEmployees(
    sourceDepartmentId: number, 
    targetDepartmentId: number, 
    employeeIds: number[]
  ): Promise<void>;
}