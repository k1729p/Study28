import { Client } from '@elastic/elasticsearch';

import { Department } from "../../models/department.js";
import { clientPromise } from "./elasticsearch.pool.js";
import { Initialization } from "../initialization.js";
import { INDEX_DEPARTMENTS, INDEX_EMPLOYEES} from "./elasticsearch.constants.js";

/**
 * This service class provides methods to initialize database and load data.
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
        index: [INDEX_DEPARTMENTS, INDEX_EMPLOYEES],
        ignore_unavailable: true
      });
      await client.indices.create({ index: INDEX_DEPARTMENTS });
      await client.indices.create({ index: INDEX_EMPLOYEES });
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
          _index: INDEX_DEPARTMENTS,
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
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("ElasticsearchInitialization.insertEmployees(): no employees to insert");
      return;
    }
    const operations = employees.flatMap(emp => [
      {
        index: {
          _index: INDEX_EMPLOYEES,
          _id: emp.id.toString()
        }
      },
      {
        id: emp.id,
        departmentId: emp.departmentId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        title: emp.title,
        phone: emp.phone,
        mail: emp.mail,
        streetName: emp.streetName,
        houseNumber: emp.houseNumber,
        postalCode: emp.postalCode,
        locality: emp.locality,
        province: emp.province,
        country: emp.country
      }
    ]);
    await client.bulk({ refresh: true, operations });
    console.log("ElasticsearchInitialization.insertEmployees(): employees count[%d]", employees.length);
  }
}
