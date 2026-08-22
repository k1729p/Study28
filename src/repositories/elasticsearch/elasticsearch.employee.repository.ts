import { errors } from '@elastic/elasticsearch';

import { Employee } from "../../models/employee.js";
import { EmployeeRepository } from "../employee.repository.js";
import { clientPromise } from "./elasticsearch.pool.js";
import { employeeToDocument, sourceToEmployee } from "./elasticsearch.mappers.js";
import * as constants from "./elasticsearch.constants.js";
/**
 * Repository interface providing methods to manage employees.
 * Includes CRUD operations to create, read, update, and delete employees.
 */
export class ElasticsearchEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * 
   * @param employee - The employee to be created.
   * @returns A promise that resolves when the employee is created.
   */
  async createEmployee(employee: Employee): Promise<void> {
    const client = await clientPromise;
    try {
      await client.index({
        index: constants.INDEX_EMPLOYEES,
        id: employee.id.toString(),
        document: employeeToDocument(employee),
        refresh: true // Ensures the data is immediately available for searching
      });
    } catch (err) {
      console.error("ElasticsearchEmployeeRepository.createEmployee():", err);
      throw err;
    }
    console.log("ElasticsearchEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Retrieves all employees.
   * 
   * @returns A promise that resolves to an array of Employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    const client = await clientPromise;
    try {
      const searchResponse = await client.search({
        index: constants.INDEX_EMPLOYEES,
        size: constants.MAX_RESULTS,
        sort: [{ ['id']: 'asc' }]
      });
      const employees = searchResponse.hits.hits
        .filter(hit => hit._source)
        .map(hit => sourceToEmployee(hit._source));
      console.log("ElasticsearchEmployeeRepository.getEmployees(): employees count[%d]", employees.length);
      return employees;
    } catch (err) {
      console.error("ElasticsearchEmployeeRepository.getEmployees():", err);
      throw err;
    }
  }
  /**
   * Retrieves an employee by their ID.
   * 
   * @param id - The ID of the employee to retrieve.
   * @returns A promise that resolves to the Employee object if found, otherwise undefined.
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const client = await clientPromise;
    try {
      const employeeGetResponse = await client.get(
        { index: constants.INDEX_EMPLOYEES, id: id.toString() },
        { ignore: [404] }
      );
      if (!employeeGetResponse.found || !employeeGetResponse._source) {
        console.log("ElasticsearchEmployeeRepository.getEmployee(): employee not found, employee id[%d]", id);
        return undefined;
      }
      console.log("ElasticsearchEmployeeRepository.getEmployee(): employee id[%d]", id);
      return sourceToEmployee(employeeGetResponse._source);
    } catch (err) {
      console.error("ElasticsearchEmployeeRepository.getEmployee():", err);
      throw err;
    }
  }
  /**
   * Updates an existing employee.
   * This performs a partial update (Elasticsearch 'update' API), merging the given fields
   * into the existing document rather than replacing it outright.
   * 
   * @param employee - The employee object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateEmployee(employee: Employee): Promise<void> {
    const client = await clientPromise;
    try {
      await client.update({
        index: constants.INDEX_EMPLOYEES,
        id: employee.id.toString(),
        doc: employeeToDocument(employee),
        refresh: true
      });
    } catch (err) {
      if (err instanceof errors.ResponseError && err.statusCode === 404) {
        console.log("ElasticsearchEmployeeRepository.updateEmployee(): " +
          "employee not found, employee id[%d]", employee.id);
        return;
      }
      console.error("ElasticsearchEmployeeRepository.updateEmployee():", err);
      throw err;
    }
    console.log("ElasticsearchEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Deletes an employee by their ID.
   * 
   * @param id - The ID of the employee to be deleted.
   * @returns A promise that resolves when the employee is deleted.
   */
  async deleteEmployee(id: number): Promise<void> {
    const client = await clientPromise;
    try {
      await client.delete(
        { index: constants.INDEX_EMPLOYEES, id: id.toString(), refresh: true },
        { ignore: [404] }
      );
    } catch (err) {
      console.error("ElasticsearchEmployeeRepository.deleteEmployee():", err);
      throw err;
    }
    console.log("ElasticsearchEmployeeRepository.deleteEmployee(): employee id[%d]", id);
  }
}
