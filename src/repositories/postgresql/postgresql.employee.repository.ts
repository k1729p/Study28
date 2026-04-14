import { Employee } from "../../models/employee.js";
import { poolPromise } from "./postgresql.pool.js";
import {
  CREATE_EMPLOYEE_SQL, SELECT_EMPLOYEES_SQL, SELECT_EMPLOYEE_SQL,
  UPDATE_EMPLOYEE_SQL, DELETE_EMPLOYEE_SQL
} from "./postgresql.constants.js";
/**
 * This service class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 */
export class PostgreSQLEmployeeRepository {
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
      const result = await client.query(CREATE_EMPLOYEE_SQL, [
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
        console.log("PostgreSQLEmployeeRepository.createEmployee(): no employee created, employee id[%d]",
          employee.id);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSQLEmployeeRepository.createEmployee():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSQLEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Gets the employees.
   * @returns an array of Employee objects
   */
  async getEmployees(): Promise<Employee[]> {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      const result = await client.query(SELECT_EMPLOYEES_SQL);
      console.log("PostgreSQLEmployeeRepository.getEmployees():");
      return result.rows as Employee[];
    } catch (err) {
      console.error("PostgreSQLEmployeeRepository.getEmployees():", err);
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
      const result = await client.query(SELECT_EMPLOYEE_SQL, [id]);
      if (!result.rowCount) {
        console.log("PostgreSQLEmployeeRepository.getEmployee(): no employee found, employee id[%d]",
          id);
        return undefined;
      }
      console.log("PostgreSQLEmployeeRepository.getEmployee(): employee id[%d]", id);
      return result.rows[0] as Employee;
    } catch (err) {
      console.error("PostgreSQLEmployeeRepository.getEmployee():", err);
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
      const result = await client.query(UPDATE_EMPLOYEE_SQL, [
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
        console.log("PostgreSQLEmployeeRepository.updateEmployee(): no employee updated, employee id[%d]",
          employee.id);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSQLEmployeeRepository.updateEmployee():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSQLEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
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
      await client.query(DELETE_EMPLOYEE_SQL, [id]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSQLEmployeeRepository.deleteEmployee():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSQLEmployeeRepository.deleteEmployee(): employee id[%d]", id);
  }

}