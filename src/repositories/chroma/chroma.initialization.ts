import { ChromaClient } from "chromadb";

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import * as constants from "./chroma.constants.js";
import * as helpers from "./chroma.helpers.js";
import { clientPromise } from "./chroma.pool.js";
import { Initialization } from "../initialization.js";
/**
 * This service class provides methods to initialize database and load data.
 */
export class ChromaInitialization implements Initialization {
  /**
   * Loads the initial data into the database.
   * 
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    const client = await clientPromise;
    try {
      await this.dropCollections(client);
      const departmentsCollection = await client.createCollection({
        name: constants.DEPARTMENTS_COLLECTION,
        embeddingFunction: null
      });
      const employeesCollection = await client.createCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      console.log("ChromaInitialization.loadInitialData(): dropped and created collections");
      if (departments.length > 0) {
        await this.insertDepartments(departmentsCollection, departments);
        await this.insertEmployees(employeesCollection, departments);
      } else {
        console.warn("ChromaInitialization.loadInitialData(): no departments to insert");
      }
    } catch (err) {
      console.error("ChromaInitialization.loadInitialData():", err);
      throw err;
    }
    console.log("ChromaInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Drops the "departments" and "employees" collections if they exist.
   * @param client the Chroma client
   */
  private async dropCollections(client: ChromaClient) {
    for (const name of [constants.EMPLOYEES_COLLECTION, constants.DEPARTMENTS_COLLECTION]) {
      try {
        await client.deleteCollection({ name });
      } catch {
        // collection did not exist yet - nothing to drop
      }
    }
  }
  /**
   * Inserts the department data into the database.
   * 
   * @param collection the "departments" collection
   * @param departments the array of departments
   */
  private async insertDepartments(collection: any, departments: Department[]) {
    await collection.add({
      ids: departments.map(department => String(department.id)),
      embeddings: departments.map(dep => helpers.toPlaceholderEmbedding(dep.name)),
      documents: departments.map(dep => dep.name),
      metadatas: departments.map(dep => helpers.toDepartmentMetadata(dep))
    });
    console.log("ChromaInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee data into the database.
   * @param collection the "employees" collection
   * @param departments the array of departments with employees
   */
  private async insertEmployees(collection: any, departments: Department[]) {
    const employees: Employee[] = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("ChromaInitialization.insertEmployees(): no employees to insert");
      return;
    }
    await collection.add({
      ids: employees.map(emp => String(emp.id)),
      embeddings: employees.map(emp => helpers.toPlaceholderEmbedding(`${emp.firstName} ${emp.lastName}`)),
      documents: employees.map(emp => `${emp.firstName} ${emp.lastName}`),
      metadatas: employees.map(emp => helpers.toEmployeeMetadata(emp))
    });
    console.log("ChromaInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}
