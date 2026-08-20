import { Employee } from "../../models/employee.js";
import { poolPromise } from "./oracle.pool.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as mappers from "../mappers.js";
import * as constants from "./oracle.constants.js";
/**
 * Repository interface providing methods to manage employees.
 * Includes CRUD operations to create, read, update, and delete employees.
 */
export class OracleEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * 
   * @param employee - The employee to be created.
   * @returns A promise that resolves when the employee is created.
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
   * Retrieves all employees.
   * 
   * @returns A promise that resolves to an array of Employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.SELECT_EMPLOYEES_SQL);
      const rows = result.rows as any[] || [];
      console.log("OracleEmployeeRepository.():");
      const employees = rows.map(row => mappers.mapDatabaseRowToEmployee(row, true));
      console.log("OracleDepartmentRepository.getEmployees(): employees count[%d]", employees.length);
      return employees;
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
   * Retrieves an employee by their ID.
   * 
   * @param id - The ID of the employee to retrieve.
   * @returns A promise that resolves to the Employee object if found, otherwise undefined.
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.SELECT_EMPLOYEE_SQL, { id });
      const rows = result.rows as any[] || [];
      if (!rows.length) {
        console.log("OracleEmployeeRepository.getEmployee(): employee not found, employee id[%d]", id);
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
   * 
   * @param employee - The employee object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateEmployee(employee: Employee): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.UPDATE_EMPLOYEE_SQL, constants.BIND_PARAMETERS_FOR_EMPLOYEE(employee));
      if (!result.rowsAffected) {
        await connection.rollback();
        console.log("OracleEmployeeRepository.updateEmployee(): employee not updated, employee id[%d]",
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
   * Deletes an employee by their ID.
   * 
   * @param id - The ID of the employee to be deleted.
   * @returns A promise that resolves when the employee is deleted.
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
