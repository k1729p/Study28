import { Department } from "../../models/department.js";
import { clientPromise } from "./cassandra.pool.js";
import { parametersForDepartment, parametersForEmployee } from "./cassandra.mappers.js";
import { Initialization } from "../initialization.js";
import * as constants from "./cassandra.constants.js";
/**
 * Repository class providing methods to initialize the database and load seed data.
 */
export class CassandraInitialization implements Initialization {
  /**
   * Loads initial department data into the database.
   * 
   * @param departments - An array of Department objects to populate.
   * @returns A promise that resolves when data loading is complete.
   */
  async loadInitialData(departments: Department[]) {
    try {
      const client = await clientPromise;
      await client.execute(constants.CREATE_KEYSPACE_CQL);
      await client.execute(constants.DROP_TABLE_EMPLOYEES_CQL);
      await client.execute(constants.DROP_TABLE_DEPARTMENTS_CQL);
      await client.execute(constants.CREATE_TABLE_DEPARTMENTS_CQL);
      await client.execute(constants.CREATE_TABLE_EMPLOYEES_CQL);
      await client.execute(constants.CREATE_INDEX_EMPLOYEES_ID_CQL);
      console.log("CassandraInitialization.loadInitialData(): dropped and created tables");
      if (departments.length > 0) {
        await this.insertDepartments(client, departments);
        await this.insertEmployees(client, departments);
      } else {
        console.warn("CassandraInitialization.loadInitialData(): no departments to insert");
      }
    } catch (err) {
      console.error("CassandraInitialization.loadInitialData():", err);
      throw err;
    }
    console.log("CassandraInitialization.loadInitialData(): data loaded successfully");
  }

  /**
   * Inserts the department data into the database.
   * @param client the Cassandra client
   * @param departments the array of departments
   */
  private async insertDepartments(client: any, departments: Department[]) {
    for (const department of departments) {
      await client.execute(constants.INSERT_DEPARTMENT_CQL,
        parametersForDepartment(department), { prepare: true });
    }
    console.log("CassandraInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }

  /**
   * Inserts the employee data into the database.
   * @param client the Cassandra client
   * @param departments the array of departments with employees
   */
  private async insertEmployees(client: any, departments: Department[]) {
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("CassandraInitialization.insertEmployees(): no employees to insert");
      return;
    }
    for (const employee of employees) {
      await client.execute(constants.INSERT_EMPLOYEE_CQL,
        parametersForEmployee(employee), { prepare: true });
    }
    console.log("CassandraInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}
