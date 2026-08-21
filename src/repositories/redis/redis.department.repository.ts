import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { clientPromise } from "./redis.pool.js";
import { DepartmentRepository } from "../department.repository.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export class RedisDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  async createDepartment(department: Department): Promise<void> {
    const client = await clientPromise;
    try {
      const key = `${'department:'}${department.id}`;
      const { employees, ...deptData } = department; // Exclude employees if storing separately
      await client.set(key, JSON.stringify(deptData));
      console.log("RedisDepartmentRepository.createDepartment(): department id[%d]", department.id);
    } catch (err) {
      console.error("RedisDepartmentRepository.createDepartment():", err);
      throw err;
    }
  }
  /**
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const client = await clientPromise;
    try {
      const departmentKeys = await client.keys('department:*');
      const departments: Department[] = [];
      const departmentMap = new Map<number, Department>();
      if (departmentKeys.length > 0) {
        const departmentStrings = await client.mGet(departmentKeys);
        for (const departmentStr of departmentStrings) {
          if (departmentStr) {
            const departmentParsed = JSON.parse(departmentStr);
            const department: Department = {
              ...departmentParsed,
              startDate: departmentParsed.startDate ? new Date(departmentParsed.startDate) : undefined,
              endDate: departmentParsed.endDate ? new Date(departmentParsed.endDate) : undefined,
              employees: []
            };
            departments.push(department);
            departmentMap.set(department.id, department);
          }
        }
      }
      const employeeKeys = await client.keys('employee:*');
      if (employeeKeys.length > 0) {
        const employeeStrings = await client.mGet(employeeKeys);
        for (const employeeStr of employeeStrings) {
          if (employeeStr) {
            const employeeParsed: Employee = JSON.parse(employeeStr);
            const parentDepartment = departmentMap.get(employeeParsed.departmentId);
            if (parentDepartment) {
              parentDepartment.employees.push(employeeParsed);
            }
          }
        }
      }
      console.log("RedisDepartmentRepository.getDepartments(): departments count[%d]", departments.length);
      return departments;
    } catch (err) {
      console.error("RedisDepartmentRepository.getDepartments():", err);
      throw err;
    }
  }
  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    console.log("RedisDepartmentRepository.getDepartment(): department id[%d]", id);
    return undefined;
  }
  /**
   * Updates an existing department.
   * 
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateDepartment(department: Department): Promise<void> {
    console.log("RedisDepartmentRepository.updateDepartment() department id[%d]", department.id);
  }
  /**
   * Deletes a department by its ID.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    console.log("RedisDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    if (employeeIds.length === 0) {
      console.warn("RedisDepartmentRepository.transferEmployees(): no employee ids provided, nothing to transfer");
      return;
    }
    // to implement
    console.log("RedisDepartmentRepository.transferEmployees(): " +
      "source department id[%d], target department id[%d], transferred employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}