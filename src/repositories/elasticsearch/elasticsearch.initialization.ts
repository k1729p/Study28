import { Client } from '@elastic/elasticsearch';

import { Department } from "../../models/department.js";
import { clientPromise } from "./elasticsearch.pool.js";
import { Initialization } from "../initialization.js";
import * as constants from "./elasticsearch.constants.js";
/**
 * Repository class providing methods to initialize the database and load seed data.
 */
export class ElasticsearchInitialization implements Initialization {
  /**
   * Loads initial department data into the database.
   * 
   * @param departments - An array of Department objects to populate.
   * @returns A promise that resolves when data loading is complete.
   */
  async loadInitialData(departments: Department[]) {
    const client: Client = await clientPromise;
    try {
      await client.indices.delete({
        index: [constants.INDEX_DEPARTMENTS, constants.INDEX_EMPLOYEES],
        ignore_unavailable: true
      });
      await client.indices.create({ index: constants.INDEX_DEPARTMENTS });
      await client.indices.create({ index: constants.INDEX_EMPLOYEES });
      console.log("ElasticsearchInitialization.loadInitialData(): dropped and created indices");
      if (departments.length > 0) {
        await this.insertDepartments(client, departments);
        await this.insertEmployees(client, departments);
      } else {
        console.warn("ElasticsearchInitialization.loadInitialData(): no departments to insert");
      }
    } catch (err) {
      console.error("ElasticsearchInitialization.loadInitialData():", err);
      throw err;
    }
    console.log("ElasticsearchInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Inserts the department data into the database.
   * @param client the client
   * @param departments the array of departments
   */
  private async insertDepartments(client: Client, departments: Department[]) {
    const operations = departments.flatMap(department => [
      {
        index: {
          _index: constants.INDEX_DEPARTMENTS,
          _id: department.id.toString()
        }
      },
      constants.DEPARTMENT_TO_DOCUMENT(department)
    ]);
    await client.bulk({ refresh: true, operations });
    console.log("ElasticsearchInitialization.insertDepartments(): departments count[%d]", departments.length);
  }
  /**
   * Inserts the employee data into the database.
   * @param client the client
   * @param departments the array of departments with employees
   */
  private async insertEmployees(client: Client, departments: Department[]) {
    const employees = departments.flatMap(department =>
      department.employees.map(emp => ({ ...emp, departmentId: department.id }))
    );
    if (employees.length === 0) {
      console.warn("ElasticsearchInitialization.insertEmployees(): no employees to insert");
      return;
    }
    const operations = employees.flatMap(employee => [
      {
        index: {
          _index: constants.INDEX_EMPLOYEES,
          _id: employee.id.toString()
        }
      },
      constants.EMPLOYEE_TO_DOCUMENT(employee)
    ]);
    await client.bulk({ refresh: true, operations });
    console.log("ElasticsearchInitialization.insertEmployees(): employees count[%d]", employees.length);
  }
}
