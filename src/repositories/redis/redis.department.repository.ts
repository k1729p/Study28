import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { DepartmentRepository } from "../department.repository.js";
import { clientPromise } from "./redis.pool.js";
import { buildDepartmentKey, buildEmployeeKey, recordToDepartment } from "./redis.mappers.js";
import * as constants from "./redis.constants.js";
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
      const { employees, ...departmentData } = department; // exclude employees
      await client.set(buildDepartmentKey(department.id), JSON.stringify(departmentData));
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
      const departmentKeys = await client.keys(constants.DEPARTMENT_KEY_PATTERN);
      if (departmentKeys.length === 0) {
        console.log("RedisEmployeeRepository.getDepartments(): departments not found");
        return [];
      }
      const departments: Department[] = [];
      const departmentMap = new Map<number, Department>();
      const departmentStrings = await client.mGet(departmentKeys);
      for (const departmentStr of departmentStrings) {
        if (departmentStr) {
          const department = recordToDepartment(departmentStr);
          departments.push(department);
          departmentMap.set(department.id, department);
        }
      }
      const employeeKeys = await client.keys(constants.EMPLOYEE_KEY_PATTERN);
      if (employeeKeys.length > 0) {
        const employeeStrings = await client.mGet(employeeKeys);
        for (const employeeStr of employeeStrings) {
          if (employeeStr) {
            const employee: Employee = JSON.parse(employeeStr);
            const parentDepartment = departmentMap.get(employee.departmentId);
            if (parentDepartment) {
              parentDepartment.employees.push(employee);
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
   * Retrieves a department by its ID, together with the employees currently assigned to it.
   * The matching employees are found by scanning the `employee:*` key space.
   *
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const client = await clientPromise;
    try {
      const departmentJson = await client.get(buildDepartmentKey(id));
      if (!departmentJson) {
        console.log("RedisDepartmentRepository.getDepartment(): department not found, department id[%d]", id);
        return undefined;
      }
      const department = recordToDepartment(departmentJson);
      const employeeEntries = await this.findEmployeeEntriesByDepartmentId(client, id);
      department.employees = employeeEntries.map(entry => entry.employee);


      console.log("RedisDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("RedisDepartmentRepository.getDepartment():", err);
      throw err;
    }
  }
  /**
   * Updates an existing department, but only if it already exists.
   * Only the department's own fields are persisted.
   * Its `employees` array is a read-time composition of
   * separately stored employee records, not the source of truth.
   *
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateDepartment(department: Department): Promise<void> {
    const client = await clientPromise;
    try {
      const departmentKey = buildDepartmentKey(department.id);
      const exists = await client.exists(departmentKey);
      if (!exists) {
        console.log("RedisDepartmentRepository.updateDepartment(): " +
          "department not found, department id[%d]", department.id);
        return;
      }
      const { employees, ...departmentData } = department; // exclude employees
      await client.set(departmentKey, JSON.stringify(departmentData));
    } catch (err) {
      console.error("RedisDepartmentRepository.updateDepartment():", err);
      throw err;
    }
    console.log("RedisDepartmentRepository.updateDepartment() department id[%d]", department.id);
  }
  /**
   * Deletes a department by its ID, together with every employee currently assigned to it.
   * The department key and its dependent employee keys are removed with a single `DEL` call.
   *
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    const client = await clientPromise;
    try {
      const dependentEmployeeEntries = await this.findEmployeeEntriesByDepartmentId(client, id);
      const keysToDelete = [buildDepartmentKey(id), ...dependentEmployeeEntries.map(entry => entry.key)];
      await client.del(keysToDelete);
    } catch (err) {
      console.error("RedisDepartmentRepository.deleteDepartment():", err);
      throw err;
    }
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
    const client = await clientPromise;
    try {
      const employeeKeys = employeeIds.map(buildEmployeeKey);
      await client.eval(constants.TRANSFER_EMPLOYEES_LUA, {
        keys: employeeKeys,
        arguments: [String(sourceDepartmentId), String(targetDepartmentId)]
      });
      console.log("RedisDepartmentRepository.transferEmployees(): " +
        "source department id[%d], target department id[%d], employees count[%d]",
        sourceDepartmentId, targetDepartmentId, employeeIds.length);
    } catch (err) {
      console.error("RedisDepartmentRepository.transferEmployees():", err);
      throw err;
    }
  }
  /**
   * Scans every `employee:*` record and returns the ones
   * that currently belong to the given department, paired with their Redis keys
   * so callers can read and/or delete them without a second scan.
   *
   * @param client - the connected Redis client
   * @param departmentId - the department id to match
   * @returns a promise resolving to the matching entries, sorted by employee id
   */
  private async findEmployeeEntriesByDepartmentId(client: any, departmentId: number):
    Promise<{ key: string; employee: Employee }[]> {
    const employeeKeys: string[] = await client.keys(constants.EMPLOYEE_KEY_PATTERN);
    if (employeeKeys.length === 0) {
      return [];
    }
    const employeeStrings = await client.mGet(employeeKeys);
    const employeeEntries: { key: string; employee: Employee }[] = [];
    employeeKeys.forEach((key: string, index: number) => {
      if (!employeeStrings[index]) {
        return;
      }
      const employee: Employee = JSON.parse(employeeStrings[index]);
      if (employee.departmentId === departmentId) {
        employeeEntries.push({ key, employee });
      }
    });
    employeeEntries.sort((emp1, emp2) => emp1.employee.id - emp2.employee.id);
    return employeeEntries;
  }
}
