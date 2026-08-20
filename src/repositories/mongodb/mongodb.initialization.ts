import { Db, Collection } from "mongodb";

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { config } from "./../../configuration/configuration.js";
import { poolPromise } from "./mongodb.pool.js";
import { Initialization } from "../initialization.js";
/**
 * Repository class providing methods to initialize the database and load seed data.
 */
export class MongoDbInitialization implements Initialization {
  /**
   * Loads initial department data into the database.
   * 
   * @param departments - An array of Department objects to populate.
   * @returns A promise that resolves when data loading is complete.
   */
  async loadInitialData(departments: Department[]) {
    const localDepartments: Department[] = structuredClone(departments);
    localDepartments.forEach(department => department.employees = []);
    const allEmployees: Employee[] = departments.flatMap(department =>
      department.employees.map(employee => ({ ...employee, departmentId: department.id }))
    );
    try {
      const client = await poolPromise;
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await departmentCollection.drop();
      await employeeCollection.drop();
      console.log("MongoDbInitialization.loadInitialData(): dropped collections");

      await departmentCollection.insertMany(localDepartments);
      await employeeCollection.insertMany(allEmployees);
    } catch (err) {
      console.error("MongoDbInitialization.loadInitialData():", err);
      throw err;
    }
    console.log("MongoDbInitialization.loadInitialData(): data loaded successfully");
  }
}
