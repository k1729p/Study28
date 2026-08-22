import { Department } from "../../models/department.js";
import { Initialization } from "../initialization.js";
import { clientPromise } from "./redis.pool.js";
/**
 * Repository class providing methods to initialize the database and load seed data.
 * 
 * Storage model:
 * 1. A department is stored as a JSON string under key `department:{id}`,
 *    without its `employees`, which are stored separately and re-attached on read.
 * 2. An employee is stored as a JSON string under key `employee:{id}`,
 *    carrying a `departmentId` back-reference to its owning department.
 */
export class RedisInitialization implements Initialization {
  /**
   * Loads initial department data into the database.
   * 
   * @param departments - An array of Department objects to populate.
   * @returns A promise that resolves when data loading is complete.
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
   * 
   * @param client the connection client
   * @param departments the array of departments
   */
  private async insertDepartments(client: any, departments: Department[]) {
    for (const department of departments) {
      // This line uses a combination of Object Destructuring and the Rest Syntax
      // to effectively "filter out" the employees property while keeping everything else.
      const { employees, ...deptWithoutEmployees } = department;
      await client.set(`department:${department.id}`, JSON.stringify(deptWithoutEmployees));
    }
    console.log("RedisInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee data.
   * 
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
    for (const employee of employees) {
      await client.set(`employee:${employee.id}`, JSON.stringify(employee));
    }
    console.log("RedisInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}