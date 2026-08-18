import { Employee } from "../../models/employee.js";
import { poolPromise } from "./postgresql.pool.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as mappers from "../mappers.js";
import * as constants from "./postgresql.constants.js";
/**
 * This repository class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 */
export class PostgreSqlEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * @param employee the employee to be created
   * @return void
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
        console.log("PostgreSqlEmployeeRepository.createEmployee(): no employee created, employee id[%d]",
          employee.id);
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
   * Gets the employees.
   * @returns an array of Employee objects
   */
  async getEmployees(): Promise<Employee[]> {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      const result = await client.query(constants.SELECT_EMPLOYEES_SQL);
      console.log("PostgreSqlEmployeeRepository.getEmployees():");
      return result.rows.map(row => mappers.mapDatabaseRowToEmployee(row, true));
    } catch (err) {
      console.error("PostgreSqlEmployeeRepository.getEmployees():", err);
      throw err;
    } finally {
      client.release();
    }
  }
  /**
   * Gets the employee by id.
   * @param id the id of the employee to retrieve
   * @returns the Employee object if found, otherwise undefined
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      const result = await client.query(constants.SELECT_EMPLOYEE_SQL, [id]);
      if (!result.rowCount) {
        console.log("PostgreSqlEmployeeRepository.getEmployee(): no employee found, employee id[%d]",
          id);
        return undefined;
      }
      console.log("PostgreSqlEmployeeRepository.getEmployee(): employee id[%d]", id);
      return mappers.mapDatabaseRowToEmployee(result.rows[0], true);
    } catch (err) {
      console.error("PostgreSqlEmployeeRepository.getEmployee():", err);
      throw err;
    } finally {
      client.release();
    }
  }
  /**
   * Updates an existing employee.
   * @param employee the employee to be updated
   * @returns void
   */
  async updateEmployee(employee: Employee) {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(constants.UPDATE_EMPLOYEE_SQL, [
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
      if (!result.rowCount) {
        await client.query('ROLLBACK');
        console.log("PostgreSqlEmployeeRepository.updateEmployee(): no employee updated, employee id[%d]",
          employee.id);
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
   * Deletes a employee by its id.
   *
   * @param id the id of the employee to be deleted
   * @returns void
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