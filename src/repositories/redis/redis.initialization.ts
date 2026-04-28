import { Department } from "../../models/department.js";
import { clientPromise } from "./redis.pool.js";
import { Initialization } from "../initialization.js";

/**
 * This service class provides methods to initialize the database and load data.
 */
export class RedisInitialization implements Initialization {
  /**
   * Loads the initial data.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    const client = await clientPromise;
    try {
      const employeeKeys = await client.keys('employee:*');
      if (employeeKeys.length > 0) {
        await client.del(employeeKeys);
        console.log("RedisInitialization.loadInitialData(): 'employee' keys deleted");
      }
      const departmentKeys = await client.keys('department:*');
      if (departmentKeys.length > 0) {
        await client.del(departmentKeys);
        console.log("RedisInitialization.loadInitialData(): 'department' keys deleted");
      }
      if (departments.length > 0) {
        await this.insertDepartments(client, departments);
        await this.insertEmployees(client, departments);
      } else {
        console.warn("RedisInitialization.loadInitialData(): no departments to insert");
      }
    } catch (err) {
      console.error("RedisInitialization.loadInitialData():", err);
      throw err;
    }
    console.log("RedisInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Inserts the department data.
   * @param client the connection client
   * @param departments the array of departments
   */
  private async insertDepartments(client: any, departments: Department[]) {
    for (const dept of departments) {
      /* This line uses a combination of Object Destructuring and
       * the Rest Syntax to effectively "filter out"
       * the employees property while keeping everything else.
       */
      const { employees, ...deptWithoutEmployees } = dept;
      const key = `department:${dept.id}`;
      await client.set(key, JSON.stringify(deptWithoutEmployees));
    }
    console.log("RedisInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee data.
   * @param client the connection client
   * @param departments the array of departments with employees
   */
  private async insertEmployees(client: any, departments: Department[]) {
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("RedisInitialization.insertEmployees(): no employees to insert");
      return;
    }
    for (const emp of employees) {
      const key = `employee:${emp.id}`;
      await client.set(key, JSON.stringify(emp));
    }
    console.log("RedisInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}