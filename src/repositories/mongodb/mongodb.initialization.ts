import { MongoClient, Db, Collection, InsertManyResult } from "mongodb";

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { config } from "./../../configuration/configuration.js";

/**
 * This service class provides methods to initialize database and load data.
 */
export class MongoDbInitialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    const allEmployees: Employee[] = departments.flatMap(department =>
      department.employees.map(employee => ({ ...employee, departmentId: department.id }))
    );
    departments.forEach(department => department.employees = []);

    const client = new MongoClient(config.mongoDbUri);
    let insertedDepartments = 0, insertedEmployees = 0;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');

      await departmentCollection.drop();
      await employeeCollection.drop();

      const insertManyResultDep: InsertManyResult<Department> = await departmentCollection.insertMany(departments);
      insertedDepartments = insertManyResultDep.insertedCount;
      const insertManyResultEmp: InsertManyResult<Employee> = await employeeCollection.insertMany(allEmployees);
      insertedEmployees = insertManyResultEmp.insertedCount;
    } catch (err) {
      console.error("MongoDbInitialization.loadInitialData():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbInitialization.loadInitialData(): inserted departments number[%d], inserted employees number[%d]",
      insertedDepartments, insertedEmployees);
  }
}
