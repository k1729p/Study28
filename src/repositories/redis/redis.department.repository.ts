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
      // 1. Fetch all Department keys
      const depKeys = await client.keys('department:*');
      const departments: Department[] = [];
      const departmentMap = new Map<number, Department>();

      if (depKeys.length > 0) {
        // Fetch all department JSON strings at once using mGet
        const depStrings = await client.mGet(depKeys);
        
        for (const depStr of depStrings) {
          if (depStr) {
            const parsed = JSON.parse(depStr);
            // Reconstruct the Date objects from the JSON strings
            const dept: Department = {
              ...parsed,
              startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
              endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
              employees: [] // Initialize empty array
            };
            departments.push(dept);
            departmentMap.set(dept.id, dept);
          }
        }
      }

      // 2. Fetch all Employee keys to simulate the SQL JOIN
      const empKeys = await client.keys('employee:*');
      if (empKeys.length > 0) {
        const empStrings = await client.mGet(empKeys);
        
        for (const empStr of empStrings) {
          if (empStr) {
            const emp: Employee = JSON.parse(empStr);
            // Map the employee back to its parent department
            const parentDept = departmentMap.get(emp.departmentId);
            if (parentDept) {
              parentDept.employees.push(emp);
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
}