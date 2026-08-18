import sql from 'mssql';

import { Employee } from "../../models/employee.js";
import { poolPromise } from "./sql-server.pool.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as mappers from "../mappers.js";
import * as constants from "./sql-server.constants.js";
/**
 * This repository class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 */
export class SqlServerEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * @param employee the employee to be created
   * @return void
   */
  async createEmployee(employee: Employee): Promise<void> {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, employee.id)
        .input('departmentId', sql.Int, employee.departmentId)
        .input('firstName', sql.NVarChar, employee.firstName)
        .input('lastName', sql.NVarChar, employee.lastName)
        .input('title', sql.NVarChar, employee.title)
        .input('phone', sql.NVarChar, employee.phone)
        .input('mail', sql.NVarChar, employee.mail)
        .input('streetName', sql.NVarChar, employee.streetName)
        .input('houseNumber', sql.NVarChar, employee.houseNumber)
        .input('postalCode', sql.NVarChar, employee.postalCode)
        .input('locality', sql.NVarChar, employee.locality)
        .input('province', sql.NVarChar, employee.province)
        .input('country', sql.NVarChar, employee.country)
        .query(constants.INSERT_EMPLOYEE_SQL);
    } catch (err) {
      console.error("SqlServerEmployeeRepository.createEmployee():", err);
      throw err;
    }
    console.log("SqlServerEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Gets the employees.
   * @returns an array of Employee objects
   */
  async getEmployees(): Promise<Employee[]> {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(constants.SELECT_EMPLOYEES_SQL);
      console.log("SqlServerEmployeeRepository.getEmployees():");
      return result.recordset.map((row: any) => mappers.mapDatabaseRowToEmployee(row, true));
    } catch (err) {
      console.error("SqlServerEmployeeRepository.getEmployees():", err);
      throw err;
    }
  }
  /**
   * Gets an employee by id.
   * @param id the id of the employee to retrieve
   * @returns the Employee object if found, otherwise undefined
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(constants.SELECT_EMPLOYEE_SQL);
      if (!result.recordset.length) {
        console.log("SqlServerEmployeeRepository.getEmployee(): no employee found, employee id[%d]", id);
        return undefined;
      }
      console.log("SqlServerEmployeeRepository.getEmployee(): employee id[%d]", id);
      return mappers.mapDatabaseRowToEmployee(result.recordset[0], true);
    } catch (err) {
      console.error("SqlServerEmployeeRepository.getEmployee():", err);
      throw err;
    }
  }
  /**
   * Updates an existing employee.
   * @param employee the employee to be updated
   * @returns void
   */
  async updateEmployee(employee: Employee): Promise<void> {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, employee.id)
        .input('departmentId', sql.Int, employee.departmentId)
        .input('firstName', sql.NVarChar, employee.firstName)
        .input('lastName', sql.NVarChar, employee.lastName)
        .input('title', sql.NVarChar, employee.title)
        .input('phone', sql.NVarChar, employee.phone)
        .input('mail', sql.NVarChar, employee.mail)
        .input('streetName', sql.NVarChar, employee.streetName)
        .input('houseNumber', sql.NVarChar, employee.houseNumber)
        .input('postalCode', sql.NVarChar, employee.postalCode)
        .input('locality', sql.NVarChar, employee.locality)
        .input('province', sql.NVarChar, employee.province)
        .input('country', sql.NVarChar, employee.country)
        .query(constants.UPDATE_EMPLOYEE_SQL);
      if (!result.rowsAffected[0]) {
        console.log("SqlServerEmployeeRepository.updateEmployee(): no employee updated, employee id[%d]",
          employee.id);
        return;
      }
    } catch (err) {
      console.error("SqlServerEmployeeRepository.updateEmployee():", err);
      throw err;
    }
    console.log("SqlServerEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Deletes an employee by its id.
   * @param id the id of the employee to be deleted
   * @returns void
   */
  async deleteEmployee(id: number): Promise<void> {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query(constants.DELETE_EMPLOYEE_SQL);
    } catch (err) {
      console.error("SqlServerEmployeeRepository.deleteEmployee():", err);
      throw err;
    }
    console.log("SqlServerEmployeeRepository.deleteEmployee(): employee id[%d]", id);
  }
}
