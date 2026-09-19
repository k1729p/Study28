import { errors } from '@elastic/elasticsearch';

import { Department } from "../../models/department.js";
import { DepartmentRepository } from "../department.repository.js";
import { clientPromise } from "./elasticsearch.pool.js";
import { repositoryLock } from "./elasticsearch.initialization.js";
import { departmentToDocument, sourceToDepartment, sourceToEmployee } from "./elasticsearch.mappers.js";
import { RepositoryException } from "../repository-exception.js";
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
    const releaseRepositoryLock = await repositoryLock.acquireShared();
    const client = await clientPromise;
    try {
      await client.index({
        index: constants.INDEX_DEPARTMENTS,
        id: department.id.toString(),
        document: departmentToDocument(department),
        refresh: true // Ensures the data is immediately available for searching
      });
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.createDepartment():", err);
      throw new RepositoryException(
        `Failed to create department, department id[${department.id}]`,
        { cause: err, operation: 'createDepartment' }
      );
    } finally {
      releaseRepositoryLock();
    }
    console.log("ElasticsearchDepartmentRepository.createDepartment(): department id[%d]", department.id);
  }

  /**
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const releaseRepositoryLock = await repositoryLock.acquireShared();
    const client = await clientPromise;
    try {
      const departmentSearchResponse = await client.search({
        index: constants.INDEX_DEPARTMENTS,
        size: constants.MAX_RESULTS
      });
      const departmentHits = departmentSearchResponse.hits.hits as any[];
      const departmentMap = new Map<number, Department>();
      for (const hit of departmentHits) {
        departmentMap.set(hit._source.id, sourceToDepartment(hit._source));
      }
      const employeeSearchResponse = await client.search({
        index: constants.INDEX_EMPLOYEES,
        size: constants.MAX_RESULTS
      });
      const employeeHits = employeeSearchResponse.hits.hits as any[];
      for (const hit of employeeHits) {
        const department = departmentMap.get(hit._source.departmentId);
        if (department) {
          department.employees.push(sourceToEmployee(hit._source));
        }
      }
      const departments = Array.from(departmentMap.values());
      console.log("ElasticsearchDepartmentRepository.getDepartments(): departments count[%d]", departments.length);
      return departments;
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.getDepartments():", err);
      throw new RepositoryException(
        `Failed to get departments`,
        { cause: err, operation: 'getDepartments' }
      );
    } finally {
      releaseRepositoryLock();
    }
  }

  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const releaseRepositoryLock = await repositoryLock.acquireShared();
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
      const department = sourceToDepartment(departmentGetResponse._source);
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
          department.employees.push(sourceToEmployee(hit._source));
        }
      }
      console.log("ElasticsearchDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.getDepartment():", err);
      throw new RepositoryException(
        `Failed to get department, department id[${id}]`,
        { cause: err, operation: 'getDepartment' }
      );
    } finally {
      releaseRepositoryLock();
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
    const releaseRepositoryLock = await repositoryLock.acquireShared();
    const client = await clientPromise;
    try {
      await client.update({
        index: constants.INDEX_DEPARTMENTS,
        id: department.id.toString(),
        doc: departmentToDocument(department),
        refresh: true
      });
    } catch (err) {
      if (err instanceof errors.ResponseError && err.statusCode === 404) {
        console.log("ElasticsearchDepartmentRepository.updateDepartment(): " +
          "department not found, department id[%d]", department.id);
        return;
      }
      console.error("ElasticsearchDepartmentRepository.updateDepartment():", err);
      throw new RepositoryException(
        `Failed to update department, department id[${department.id}]`,
        { cause: err, operation: 'updateDepartment' }
      );
    } finally {
      releaseRepositoryLock();
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
    const releaseRepositoryLock = await repositoryLock.acquireShared();
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
      throw new RepositoryException(
        `Failed to delete department, department id[${id}]`,
        { cause: err, operation: 'deleteDepartment' }
      );
    } finally {
      releaseRepositoryLock();
    }
  }
}
