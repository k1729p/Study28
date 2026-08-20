import { Department } from "../../models/department.js";
import { clientPromise } from "./cassandra.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import * as mappers from "../mappers.js";
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
        constants.PARAMETERS_FOR_DEPARTMENT(department), { prepare: true });
    } catch (err) {
      console.error("CassandraDepartmentRepository.createDepartment():", err);
      throw err;
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
        departmentMap.set(row.id, mappers.mapDatabaseRowToDepartment(row));
      }
      const employeeResultSet = await client.execute(constants.SELECT_EMPLOYEES_CQL,
        [], { prepare: true });
      for (const row of employeeResultSet.rows) {
        const department = departmentMap.get(row.id);
        if (department) {
          department.employees.push(mappers.mapDatabaseRowToEmployee(row, true));
        }
      }
      console.log("CassandraDepartmentRepository.getDepartments(): departments count[%d]", departmentMap.size);
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("CassandraDepartmentRepository.getDepartments():", err);
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
    try {
      const client = await clientPromise;
      const departmentResultSet = await client.execute(constants.SELECT_DEPARTMENT_CQL,
        { id: id }, { prepare: true });
      if (departmentResultSet.rowLength === 0) {
        console.log("CassandraDepartmentRepository.getDepartment(): department not found, department id[%d]", id);
        return undefined;
      }
      const department = mappers.mapDatabaseRowToDepartment(departmentResultSet.rows[0]);
      const employeeResultSet = await client.execute(constants.SELECT_EMPLOYEES_BY_DEPARTMENT_CQL,
        { departmentId: id }, { prepare: true });
      department.employees = employeeResultSet.rows.map(row => mappers.mapDatabaseRowToEmployee(row, true));
      console.log("CassandraDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("CassandraDepartmentRepository.getDepartment():", err);
      throw err;
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
        constants.PARAMETERS_FOR_DEPARTMENT(department), { prepare: true });
      if (!resultSet.wasApplied()) {
        console.log("CassandraDepartmentRepository.updateDepartment(): " +
          "department not updated, department id[%d]", department.id);
        return;
      }
    } catch (err) {
      console.error("CassandraDepartmentRepository.updateDepartment():", err);
      throw err;
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
      throw err;
    }
    console.log("CassandraDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    if (employeeIds.length === 0) {
      console.warn("CassandraDepartmentRepository.transferEmployees(): no employee ids provided, nothing to transfer");
      return;
    }
    try {
      const client = await clientPromise;
      // Step 1: read the full rows to move. 'department_id' (the partition key) is restricted
      // to a single value and 'id' (the clustering key) is restricted with IN, so this remains
      // a single, efficient single-partition read.
      const resultSet = await client.execute(constants.SELECT_EMPLOYEES_BY_DEPARTMENT_AND_IDS_CQL,
        { departmentId: sourceDepartmentId, ids: employeeIds }, { prepare: true });
      if (resultSet.rowLength === 0) {
        console.warn("CassandraDepartmentRepository.transferEmployees(): " +
          "no matching employees found, source department id[%d]", sourceDepartmentId);
        return;
      }
      // Deleting employee from the source partition and re-inserting it into the target partition.
      // A LOGGED BATCH is Cassandra's closest equivalent to an atomic server-side procedure for this:
      // the coordinator node first persists the batch to a distributed batchlog, which guarantees
      // that either all statements are eventually applied or none are, even if the coordinator
      // fails partway through - so an employee can never end up duplicated in, or missing from, both departments.
      const queries = resultSet.rows.flatMap(row => {
        const insertValues = [
          row.id,
          targetDepartmentId,
          row.first_name,
          row.last_name,
          row.title,
          row.phone,
          row.mail,
          row.street_name,
          row.house_number,
          row.postal_code,
          row.locality,
          row.province,
          row.country
        ];
        return [
          { query: constants.DELETE_EMPLOYEE_CQL, params: { departmentId: sourceDepartmentId, id: row.id } },
          { query: constants.INSERT_EMPLOYEE_CQL, params: insertValues }
        ];
      });
      await client.batch(queries, { prepare: true });
    } catch (err) {
      console.error("CassandraDepartmentRepository.transferEmployees():", err);
      throw err;
    }
    console.log("CassandraDepartmentRepository.transferEmployees(): " +
      "source department id[%d], target department id[%d], transferred employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}
