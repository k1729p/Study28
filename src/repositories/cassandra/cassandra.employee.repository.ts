import { Employee } from "../../models/employee.js";
import { clientPromise } from "./cassandra.pool.js";
import { parametersForEmployee } from "./cassandra.mappers.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as mappers from "../mappers.js";
import * as constants from "./cassandra.constants.js";
/**
 * Repository interface providing methods to manage employees.
 * Includes CRUD operations to create, read, update, and delete employees.
 */
export class CassandraEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * 
   * @param employee - The employee to be created.
   * @returns A promise that resolves when the employee is created.
   */
  async createEmployee(employee: Employee): Promise<void> {
    try {
      const client = await clientPromise;
      await client.execute(constants.INSERT_EMPLOYEE_CQL,
        parametersForEmployee(employee), { prepare: true });
    } catch (err) {
      console.error("CassandraEmployeeRepository.createEmployee():", err);
      throw err;
    }
    console.log("CassandraEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Retrieves all employees.
   * 
   * @returns A promise that resolves to an array of Employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    try {
      const client = await clientPromise;
      const resultSet = await client.execute(constants.SELECT_EMPLOYEES_CQL,
        [], { prepare: true });
      const employees = resultSet.rows.map(row => mappers.mapDatabaseRowToEmployee(row, true));
      console.log("CassandraEmployeeRepository.getEmployees(): employees count[%d]", employees.length);
      return employees;
    } catch (err) {
      console.error("CassandraEmployeeRepository.getEmployees():", err);
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
    try {
      const client = await clientPromise;
      const resultSet = await client.execute(constants.SELECT_EMPLOYEE_BY_ID_CQL,
        { id: id }, { prepare: true });
      if (resultSet.rowLength === 0) {
        console.log("CassandraEmployeeRepository.getEmployee(): employee not found, employee id[%d]", id);
        return undefined;
      }
      console.log("CassandraEmployeeRepository.getEmployee(): employee id[%d]", id);
      return mappers.mapDatabaseRowToEmployee(resultSet.rows[0], true);
    } catch (err) {
      console.error("CassandraEmployeeRepository.getEmployee():", err);
      throw err;
    }
  }
  /**
   * Updates an existing employee.
   * 
   * @param employee - The employee object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateEmployee(employee: Employee): Promise<void> {
    try {
      const client = await clientPromise;
      // 'department_id' is part of the primary key (the partition key) of 'employees', and CQL does not allow
      // primary key columns to be modified by a plain UPDATE. First resolve which partition (department)
      // the employee currently lives in, via the secondary index on 'id'. This also acts as the existence check.
      const resultSet = await client.execute(constants.SELECT_EMPLOYEE_DEPARTMENT_ID_BY_ID_CQL,
        { id: employee.id }, { prepare: true });
      if (resultSet.rowLength === 0) {
        console.log("CassandraEmployeeRepository.updateEmployee(): employee not found, employee id[%d]", employee.id);
        return;
      }
      const departmentId = resultSet.rows[0].department_id;
      if (departmentId === employee.departmentId) {
        // The partition is unchanged: a plain, single-partition UPDATE is sufficient and the most efficient option.
        await client.execute(constants.UPDATE_EMPLOYEE_CQL,
          parametersForEmployee(employee), { prepare: true });
      } else {
        // Moving an employee to a different department is handled as a delete-then-insert across partitions.
        // Both statements are wrapped in a LOGGED BATCH for atomicity, so the employee is never
        // observably duplicated in, or missing from, both partitions.
        // A batch is Cassandra's substitute for a stored procedure.
        const queries = [
          { query: constants.DELETE_EMPLOYEE_CQL, params: { departmentId: departmentId, id: employee.id } },
          { query: constants.INSERT_EMPLOYEE_CQL, params: parametersForEmployee(employee) }
        ];
        await client.batch(queries, { prepare: true });
      }
    } catch (err) {
      console.error("CassandraEmployeeRepository.updateEmployee():", err);
      throw err;
    }
    console.log("CassandraEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Deletes an employee by their ID.
   * 
   * @param id - The ID of the employee to be deleted.
   * @returns A promise that resolves when the employee is deleted.
   */
  async deleteEmployee(id: number): Promise<void> {
    try {
      const client = await clientPromise;
      // 'department_id' (the partition key) is required to target the row for deletion, but the caller only supplies
      // the employee id, so first resolve the current partition via the secondary index 'employees_id_idx' on 'id'.
      const lookup = await client.execute(constants.SELECT_EMPLOYEE_DEPARTMENT_ID_BY_ID_CQL,
        { id: id }, { prepare: true });
      if (lookup.rowLength === 0) {
        console.log("CassandraEmployeeRepository.deleteEmployee(): employee not found, employee id[%d]", id);
        return;
      }
      const departmentId = lookup.rows[0].department_id;
      await client.execute(constants.DELETE_EMPLOYEE_CQL,
        { departmentId: departmentId, id: id }, { prepare: true });
    } catch (err) {
      console.error("CassandraEmployeeRepository.deleteEmployee():", err);
      throw err;
    }
    console.log("CassandraEmployeeRepository.deleteEmployee(): employee id[%d]", id);
  }
}
