import { errors } from '@elastic/elasticsearch';

import { Department } from "../../models/department.js";
import { DepartmentRepository } from "../department.repository.js";
import { clientPromise } from "./elasticsearch.pool.js";
import * as constants from "./elasticsearch.constants.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export class ElasticsearchDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  async createDepartment(department: Department): Promise<void> {
    const client = await clientPromise;
    try {
      await client.index({
        index: constants.INDEX_DEPARTMENTS,
        id: department.id.toString(),
        document: constants.DEPARTMENT_TO_DOCUMENT(department),
        refresh: true // Ensures the data is immediately available for searching
      });
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("ElasticsearchDepartmentRepository.createDepartment(): department id[%d]", department.id);
  }
  /**
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const client = await clientPromise;
    try {
      const departmentSearchResponse = await client.search({
        index: constants.INDEX_DEPARTMENTS,
        size: constants.MAX_RESULTS
      });
      const departmentHits = departmentSearchResponse.hits.hits as any[];
      const departmentMap = new Map<number, Department>();
      for (const hit of departmentHits) {
        departmentMap.set(hit._source.id, constants.SOURCE_TO_DEPARTMENT(hit._source));
      }
      const employeeSearchResponse = await client.search({
        index: constants.INDEX_EMPLOYEES,
        size: constants.MAX_RESULTS
      });
      const employeeHits = employeeSearchResponse.hits.hits as any[];
      for (const hit of employeeHits) {
        const department = departmentMap.get(hit._source.departmentId);
        if (department) {
          department.employees.push(constants.SOURCE_TO_EMPLOYEE(hit._source));
        }
      }
      const departments = Array.from(departmentMap.values());
      console.log("ElasticsearchDepartmentRepository.getDepartments(): departments count[%d]", departments.length);
      return departments;
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.getDepartments():", err);
      throw err;
    }
  }
  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const client = await clientPromise;
    try {
      const departmentGetResponse = await client.get(
        { index: constants.INDEX_DEPARTMENTS, id: id.toString() },
        { ignore: [404] }
      );
      if (!departmentGetResponse.found || !departmentGetResponse._source) {
        console.log("ElasticsearchDepartmentRepository.getDepartment(): department not found, department id[%d]", id);
        return undefined;
      }
      const department = constants.SOURCE_TO_DEPARTMENT(departmentGetResponse._source);
      const employeeSearchResponse = await client.search({
        index: constants.INDEX_EMPLOYEES,
        size: constants.MAX_RESULTS,
        query: {
          term: { ['departmentId']: id }
        },
        sort: [{ ['id']: 'asc' }]
      });
      const employeeHits = employeeSearchResponse.hits.hits as any[];
      for (const hit of employeeHits) {
        if (hit._source) {
          department.employees.push(constants.SOURCE_TO_EMPLOYEE(hit._source));
        }
      }
      console.log("ElasticsearchDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.getDepartment():", err);
      throw err;
    }
  }
  /**
   * Updates an existing department.
   * This performs a partial update of the department's own fields only (name, dates, notes, keywords, and image).
   * The document's 'employees' association is intentionally left untouched.
   * 
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateDepartment(department: Department): Promise<void> {
    const client = await clientPromise;
    try {
      await client.update({
        index: constants.INDEX_DEPARTMENTS,
        id: department.id.toString(),
        doc: constants.DEPARTMENT_TO_DOCUMENT(department),
        refresh: true
      });
    } catch (err) {
      if (err instanceof errors.ResponseError && err.statusCode === 404) {
        console.log("ElasticsearchDepartmentRepository.updateDepartment(): " +
          "department not found, department id[%d]", department.id);
        return;
      }
      console.error("ElasticsearchDepartmentRepository.updateDepartment():", err);
      throw err;
    }
    console.log("ElasticsearchDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }
  /**
   * Deletes a department by its ID.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    const client = await clientPromise;
    try {
      await client.deleteByQuery({
        index: constants.INDEX_EMPLOYEES,
        query: {
          term: { ['departmentId']: id }
        },
        refresh: true
      });
      await client.delete(
        { index: constants.INDEX_DEPARTMENTS, id: id.toString(), refresh: true },
        { ignore: [404] }
      );
      console.log("ElasticsearchDepartmentRepository.deleteDepartment(): department id[%d]", id);
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.deleteDepartment():", err);
      throw err;
    }
  }
  /**
   * Transfers employees from a source department to a target department.
   * The 'update_by_query' API accepts a query to select the matching documents and
   * a Painless script to mutate each one in place. A single request therefore finds every employee
   * that belongs to the source department AND is listed in 'employeeIds', and reassigns their 'departmentId'
   * to the target department - without round-tripping documents through the client.
   * The 'ctx' is the per-document update context that Elasticsearch exposes to the script.
   * The 'ctx._source' is the document being updated. The 'params' are the values passed in from the request.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    if (employeeIds.length === 0) {
      console.warn("ElasticsearchDepartmentRepository.transferEmployees(): no employee ids provided, nothing to transfer");
      return;
    }
    const client = await clientPromise;
    try {
      const updateByQueryResponse = await client.updateByQuery({
        index: constants.INDEX_EMPLOYEES,
        refresh: true,
        conflicts: 'proceed',
        query: {
          bool: {
            must: [
              { term: { ['departmentId']: sourceDepartmentId } },
              { terms: { ['id']: employeeIds } }
            ]
          }
        },
        script: {
          source: 'ctx._source.departmentId = params.targetDepartmentId',
          lang: 'painless',
          params: { targetDepartmentId }
        }
      });
      console.log("ElasticsearchDepartmentRepository.transferEmployees(): " +
        "source department id[%d], target department id[%d], transferred employees count[%d]",
        sourceDepartmentId, targetDepartmentId, updateByQueryResponse.updated ?? 0);
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.transferEmployees():", err);
      throw err;
    }
  }
}
