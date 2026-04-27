import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { clientPromise } from "./redis.pool.js";

/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods adapted for a NoSQL Key-Value store.
 */
export class RedisDepartmentRepository {
  /**
   * Creates a new department.
   * @param dept the department to be created
   * @return void
   */
  async createDepartment(dept: Department): Promise<void> {
    const client = await clientPromise;
    try {
      const key = `${'department:'}${dept.id}`;
      const { employees, ...deptData } = dept; // Exclude employees if storing separately
      await client.set(key, JSON.stringify(deptData));
      console.log("RedisDepartmentRepository.createDepartment(): ID [%d]", dept.id);
    } catch (err) {
      console.error("RedisDepartmentRepository.createDepartment():", err);
      throw err;
    }
  }
  /**
   * Gets the departments and reconstructs the relationships with employees.
   * @returns an array of Department objects
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
      console.log("RedisDepartmentRepository.getDepartments(): Retrieved [%d] departments", departments.length);
      return departments;
    } catch (err) {
      console.error("RedisDepartmentRepository.getDepartments():", err);
      throw err;
    }
  }
  async getDepartment(id: number): Promise<Department | undefined> {
    return undefined;
  }
  async updateDepartment(department: Department): Promise<void> {
  }
  async deleteDepartment(departmentId: number): Promise<void> {
  }
}