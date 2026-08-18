import { Client } from '@elastic/elasticsearch';

import { Department } from "../../models/department.js";
import { clientPromise } from "./elasticsearch.pool.js";
import { Initialization } from "../initialization.js";
import * as constants from "./elasticsearch.constants.js";

/**
 * This repository class provides methods to initialize database and load data.
 */
export class ElasticsearchInitialization implements Initialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
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
      {
        id: department.id,
        name: department.name,
        startDate: department.startDate,
        endDate: department.endDate,
        notes: department.notes,
        keywords: department.keywords || [],
        image: department.image
      }
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
      {
        id: employee.id,
        departmentId: employee.departmentId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        title: employee.title,
        phone: employee.phone,
        mail: employee.mail,
        streetName: employee.streetName,
        houseNumber: employee.houseNumber,
        postalCode: employee.postalCode,
        locality: employee.locality,
        province: employee.province,
        country: employee.country
      }
    ]);
    await client.bulk({ refresh: true, operations });
    console.log("ElasticsearchInitialization.insertEmployees(): employees count[%d]", employees.length);
  }
}
