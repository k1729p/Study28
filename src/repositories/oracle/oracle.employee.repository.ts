import { Employee } from "../../models/employee.js";
import { poolPromise } from "./oracle.pool.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as helpers from "../../controllers/helpers.js";
import * as mappers from "../mappers.js";
import * as constants from "./oracle.constants.js";
/**
 * This service class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 */
export class OracleEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * @param employee the employee to be created
   * @return void
   */
  async createEmployee(employee: Employee): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.INSERT_EMPLOYEE_SQL, constants.BIND_PARAMETERS_FOR_EMPLOYEE(employee), { autoCommit: true });
      if (!result.rowsAffected) {
        console.log("OracleEmployeeRepository.createEmployee(): no employee created, employee id[%d]",
          employee.id);
        return;
      }
    } catch (err) {
      console.error("OracleEmployeeRepository.createEmployee():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleEmployeeRepository.createEmployee(): error closing connection", err);
      }
    }
    console.log("OracleEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Gets the employees.
   * @returns an array of Employee objects
   */
  async getEmployees(): Promise<Employee[]> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.SELECT_EMPLOYEES_SQL);
      const rows = result.rows as any[] || [];
      console.log("OracleEmployeeRepository.getEmployees():");
      return rows.map(row => mappers.mapDatabaseRowToEmployee(row, true));
    } catch (err) {
      console.error("OracleEmployeeRepository.getEmployees():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleEmployeeRepository.getEmployees(): error closing connection", err);
      }
    }
  }
  /**
   * Gets the employee by id.
   * @param id the id of the employee to retrieve
   * @returns the Employee object if found, otherwise undefined
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.SELECT_EMPLOYEE_SQL, { id });
      const rows = result.rows as any[] || [];
      if (!rows.length) {
        console.log("OracleEmployeeRepository.getEmployee(): no employee found, employee id[%d]", id);
        return undefined;
      }
      console.log("OracleEmployeeRepository.getEmployee(): employee id[%d]", id);
      return mappers.mapDatabaseRowToEmployee(rows[0], true);
    } catch (err) {
      console.error("OracleEmployeeRepository.getEmployee():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleEmployeeRepository.getEmployee(): error closing connection", err);
      }
    }
  }
  /**
   * Updates an existing employee.
   * @param employee the employee to be updated
   * @returns void
   */
  async updateEmployee(employee: Employee): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.UPDATE_EMPLOYEE_SQL, constants.BIND_PARAMETERS_FOR_EMPLOYEE(employee));
      if (!result.rowsAffected) {
        await connection.rollback();
        console.log("OracleEmployeeRepository.updateEmployee(): no employee updated, employee id[%d]",
          employee.id);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("OracleEmployeeRepository.updateEmployee():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleEmployeeRepository.updateEmployee(): error closing connection", err);
      }
    }
    console.log("OracleEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Deletes a employee by its id.
   *
   * @param id the id of the employee to be deleted
   * @returns void
   */
  async deleteEmployee(id: number): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.execute(constants.DELETE_EMPLOYEE_SQL, { id }, { autoCommit: true });
    } catch (err) {
      console.error("OracleEmployeeRepository.deleteEmployee():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleEmployeeRepository.deleteEmployee(): error closing connection", err);
      }
    }
    console.log("OracleEmployeeRepository.deleteEmployee(): employee id[%d]", id);
  }
}
