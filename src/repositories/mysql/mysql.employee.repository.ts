import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { Employee } from "../../models/employee.js";
import { poolPromise } from "./mysql.pool.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as mappers from "../mappers.js";
import * as constants from "./mysql.constants.js";
/**
 * Repository interface providing methods to manage employees.
 * Includes CRUD operations to create, read, update, and delete employees.
 */
export class MySqlEmployeeRepository implements EmployeeRepository {
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
        console.log("MySqlEmployeeRepository.createEmployee(): employee not created, employee id[%d]",
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
   * Retrieves all employees.
   * 
   * @returns A promise that resolves to an array of Employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    const pool = await poolPromise;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(constants.SELECT_EMPLOYEES_SQL);
      const employees = rows.map(row => mappers.mapDatabaseRowToEmployee(row, true));
      console.log("MySqlEmployeeRepository.getEmployees():employees count[%d]", employees.length);
      return employees;
    } catch (err) {
      console.error("MySqlEmployeeRepository.getEmployees():", err);
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
    const pool = await poolPromise;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(constants.SELECT_EMPLOYEE_SQL, [id]);
      if (!rows.length) {
        console.log("MySqlEmployeeRepository.getEmployee(): employee not found, employee id[%d]", id);
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
   * 
   * @param employee - The employee object containing updated values.
   * @returns A promise that resolves when the update is complete.
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
        console.log("MySqlEmployeeRepository.updateEmployee(): employee not updated, employee id[%d]",
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
   * Deletes an employee by their ID.
   * 
   * @param id - The ID of the employee to be deleted.
   * @returns A promise that resolves when the employee is deleted.
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
