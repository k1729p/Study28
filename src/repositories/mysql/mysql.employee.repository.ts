import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { Employee } from "../../models/employee.js";
import { poolPromise } from "./mysql.pool.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as mappers from "../mappers.js";
import * as constants from "./mysql.constants.js";
/**
 * This service class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 */
export class MySqlEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * @param employee the employee to be created
   * @return void
   */
  async createEmployee(employee: Employee): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query<ResultSetHeader>(constants.INSERT_EMPLOYEE_SQL, [
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
      if (!result.affectedRows) {
        await connection.rollback();
        console.log("MySqlEmployeeRepository.createEmployee(): no employee created, employee id[%d]",
          employee.id);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlEmployeeRepository.createEmployee():", err);
      throw err;
    } finally {
      connection.release();
    }
    console.log("MySqlEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Gets the employees.
   * @returns an array of Employee objects
   */
  async getEmployees(): Promise<Employee[]> {
    const pool = await poolPromise;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(constants.SELECT_EMPLOYEES_SQL);
      console.log("MySqlEmployeeRepository.getEmployees():");
      return rows.map(row => mappers.mapDatabaseRowToEmployee(row, true));
    } catch (err) {
      console.error("MySqlEmployeeRepository.getEmployees():", err);
      throw err;
    }
  }
  /**
   * Gets the employee by id.
   * @param id the id of the employee to retrieve
   * @returns the Employee object if found, otherwise undefined
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const pool = await poolPromise;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(constants.SELECT_EMPLOYEE_SQL, [id]);
      if (!rows.length) {
        console.log("MySqlEmployeeRepository.getEmployee(): no employee found, employee id[%d]", id);
        return undefined;
      }
      console.log("MySqlEmployeeRepository.getEmployee(): employee id[%d]", id);
      return mappers.mapDatabaseRowToEmployee(rows[0], true);
    } catch (err) {
      console.error("MySqlEmployeeRepository.getEmployee():", err);
      throw err;
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
      await connection.beginTransaction();
      const [result] = await connection.query<ResultSetHeader>(constants.UPDATE_EMPLOYEE_SQL, [
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
      if (!result.affectedRows) {
        await connection.rollback();
        console.log("MySqlEmployeeRepository.updateEmployee(): no employee updated, employee id[%d]",
          employee.id);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlEmployeeRepository.updateEmployee():", err);
      throw err;
    } finally {
      connection.release();
    }
    console.log("MySqlEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Deletes a employee by its id.
   * @param id the id of the employee to be deleted
   * @returns void
   */
  async deleteEmployee(id: number): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(constants.DELETE_EMPLOYEE_SQL, [id]);
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlEmployeeRepository.deleteEmployee():", err);
      throw err;
    } finally {
      connection.release();
    }
    console.log("MySqlEmployeeRepository.deleteEmployee(): employee id[%d]", id);
  }
}
