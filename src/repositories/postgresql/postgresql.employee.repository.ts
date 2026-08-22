import { Employee } from "../../models/employee.js";
import { EmployeeRepository } from "../employee.repository.js";
import { poolPromise } from "./postgresql.pool.js";
import * as mappers from "../mappers.js";
import * as constants from "./postgresql.constants.js";
/**
 * Repository interface providing methods to manage employees.
 * Includes CRUD operations to create, read, update, and delete employees.
 */
export class PostgreSqlEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * 
   * @param employee - The employee to be created.
   * @returns A promise that resolves when the employee is created.
   */
  async createEmployee(employee: Employee) {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(constants.INSERT_EMPLOYEE_SQL, [
        employee.id,
        employee.departmentId,
        employee.firstName,
        employee.lastName,
        employee.title,
        employee.phone,
        employee.mail,
        employee.streetName,
        employee.houseNumber,
        employee.postalCode,
        employee.locality,
        employee.province,
        employee.country
      ]);
      if (!result.rowCount) {
        await client.query('ROLLBACK');
        console.log("PostgreSqlEmployeeRepository.createEmployee(): " +
          "employee not created, employee id[%d]", employee.id);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSqlEmployeeRepository.createEmployee():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSqlEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Retrieves all employees.
   * 
   * @returns A promise that resolves to an array of Employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      const queryResult = await client.query(constants.SELECT_EMPLOYEES_SQL);
      const employees = queryResult.rows.map(row => mappers.mapDatabaseRowToEmployee(row, true));
      console.log("PostgreSqlDepartmentRepository.getEmployees(): employees count[%d]", employees.length);
      return employees;
    } catch (err) {
      console.error("PostgreSqlEmployeeRepository.getEmployees():", err);
      throw err;
    } finally {
      client.release();
    }
  }
  /**
   * Retrieves an employee by their ID.
   * 
   * @param id - The ID of the employee to retrieve.
   * @returns A promise that resolves to the Employee object if found, otherwise undefined.
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      const queryResult = await client.query(constants.SELECT_EMPLOYEE_SQL, [id]);
      if (!queryResult.rowCount) {
        console.log("PostgreSqlEmployeeRepository.getEmployee(): employee not found, employee id[%d]", id);
        return undefined;
      }
      console.log("PostgreSqlEmployeeRepository.getEmployee(): employee id[%d]", id);
      return mappers.mapDatabaseRowToEmployee(queryResult.rows[0], true);
    } catch (err) {
      console.error("PostgreSqlEmployeeRepository.getEmployee():", err);
      throw err;
    } finally {
      client.release();
    }
  }
  /**
   * Updates an existing employee.
   * 
   * @param employee - The employee object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateEmployee(employee: Employee) {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryResult = await client.query(constants.UPDATE_EMPLOYEE_SQL, [
        employee.departmentId,
        employee.firstName,
        employee.lastName,
        employee.title,
        employee.phone,
        employee.mail,
        employee.streetName,
        employee.houseNumber,
        employee.postalCode,
        employee.locality,
        employee.province,
        employee.country,
        employee.id
      ]);
      if (!queryResult.rowCount) {
        await client.query('ROLLBACK');
        console.log("PostgreSqlEmployeeRepository.updateEmployee(): " +
          "employee not updated, employee id[%d]", employee.id);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSqlEmployeeRepository.updateEmployee():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSqlEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Deletes an employee by their ID.
   * 
   * @param id - The ID of the employee to be deleted.
   * @returns A promise that resolves when the employee is deleted.
   */
  async deleteEmployee(id: number) {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(constants.DELETE_EMPLOYEE_SQL, [id]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSqlEmployeeRepository.deleteEmployee():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSqlEmployeeRepository.deleteEmployee(): employee id[%d]", id);
  }
}