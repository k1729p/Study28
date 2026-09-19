import { Department } from "../../models/department.js";
import { clientPromise } from "./cassandra.pool.js";
import { parametersForDepartment } from "./cassandra.mappers.js";
import { DepartmentRepository } from "../department.repository.js";
import { RepositoryException } from "../repository-exception.js";
import * as mappers from "../repository-mappers.js";
import * as constants from "./cassandra.constants.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export class CassandraDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  async createDepartment(department: Department): Promise<void> {
    try {
      const client = await clientPromise;
      await client.execute(constants.INSERT_DEPARTMENT_CQL,
        parametersForDepartment(department), { prepare: true });
    } catch (err) {
      console.error("CassandraDepartmentRepository.createDepartment():", err);
      throw new RepositoryException(
        `Failed to create department, department id[${department.id}]`,
        { cause: err, operation: 'createDepartment' }
      );
    }
    console.log("CassandraDepartmentRepository.createDepartment(): department id[%d]", department.id);
  }

  /**
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    try {
      const client = await clientPromise;
      const departmentResultSet = await client.execute(constants.SELECT_DEPARTMENTS_CQL,
        [], { prepare: true });
      const departmentMap = new Map<number, Department>();
      for (const row of departmentResultSet.rows) {
        departmentMap.set(row.id, mappers.mapRowToDepartment(row));
      }
      const employeeResultSet = await client.execute(constants.SELECT_EMPLOYEES_CQL,
        [], { prepare: true });
      for (const row of employeeResultSet.rows) {
        const department = departmentMap.get(row.department_id);
        if (department) {
          department.employees.push(mappers.mapRowToEmployee(row, true));
        }
      }
      console.log("CassandraDepartmentRepository.getDepartments(): departments count[%d]", departmentMap.size);
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("CassandraDepartmentRepository.getDepartments():", err);
      throw new RepositoryException(
        `Failed to get departments`,
        { cause: err, operation: 'getDepartments' }
      );
    }
  }

  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    try {
      const client = await clientPromise;
      const departmentResultSet = await client.execute(constants.SELECT_DEPARTMENT_CQL,
        { id: id }, { prepare: true });
      if (departmentResultSet.rowLength === 0) {
        console.log("CassandraDepartmentRepository.getDepartment(): department not found, department id[%d]", id);
        return undefined;
      }
      const department = mappers.mapRowToDepartment(departmentResultSet.rows[0]);
      const employeeResultSet = await client.execute(constants.SELECT_EMPLOYEES_BY_DEPARTMENT_CQL,
        { departmentId: id }, { prepare: true });
      department.employees = employeeResultSet.rows.map(row => mappers.mapRowToEmployee(row, true));
      console.log("CassandraDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("CassandraDepartmentRepository.getDepartment():", err);
      throw new RepositoryException(
        `Failed to get department, department id[${id}]`,
        { cause: err, operation: 'getDepartment' }
      );
    }
  }

  /**
   * Updates an existing department.
   * 
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateDepartment(department: Department): Promise<void> {
    try {
      const client = await clientPromise;
      const resultSet = await client.execute(constants.UPDATE_DEPARTMENT_CQL,
        parametersForDepartment(department), { prepare: true });
      if (!resultSet.wasApplied()) {
        console.log("CassandraDepartmentRepository.updateDepartment(): " +
          "department not updated, department id[%d]", department.id);
        return;
      }
    } catch (err) {
      console.error("CassandraDepartmentRepository.updateDepartment():", err);
      throw new RepositoryException(
        `Failed to update department, department id[${department.id}]`,
        { cause: err, operation: 'updateDepartment' }
      );
    }
    console.log("CassandraDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }
  
  /**
   * Deletes a department by its ID.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    // Cassandra has no foreign keys and performs no cascading deletes,
    // so the department's employees must be removed explicitly.
    // Deleting the whole 'employees' partition ('WHERE department_id = ?' with no clustering column)
    // removes every employee row for this department in one native, single-partition operation.
    // Both statements are combined into a single LOGGED BATCH so they are applied atomically
    // even though they target two different tables/partitions.
    const queries = [
      { query: constants.DELETE_EMPLOYEES_CQL, params: { departmentId: id } },
      { query: constants.DELETE_DEPARTMENT_CQL, params: { id: id } }
    ];
    try {
      const client = await clientPromise;
      await client.batch(queries, { prepare: true });
    } catch (err) {
      console.error("CassandraDepartmentRepository.deleteDepartment():", err);
      throw new RepositoryException(
        `Failed to delete department, department id[${id}]`,
        { cause: err, operation: 'deleteDepartment' }
      );
    }
    console.log("CassandraDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
}
