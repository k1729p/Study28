import sql from 'mssql';

import { Employee } from "../../models/employee.js";
import { EmployeeRepository } from "../employee.repository.js";
import { RepositoryException } from "../repository-exception.js";
import { poolPromise } from "./sql-server.pool.js";
import * as mappers from "../repository-mappers.js";
import * as constants from "./sql-server.constants.js";
/**
 * Repository interface providing methods to manage employees.
 * Includes CRUD operations to create, read, update, and delete employees.
 */
export class SqlServerEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * 
   * @param employee - The employee to be created.
   * @returns A promise that resolves when the employee is created.
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
      throw new RepositoryException(
        `Failed to create employee, employee id[${employee.id}]`,
        { cause: err, operation: 'createEmployee' }
      );
    }
    console.log("SqlServerEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Retrieves all employees.
   * 
   * @returns A promise that resolves to an array of Employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(constants.SELECT_EMPLOYEES_SQL);
      const employees = result.recordset.map((row: any) => mappers.mapRowToEmployee(row, true));
      console.log("SqlServerEmployeeRepository.getEmployees(): employees count[%d]", employees.length);
      return employees;
    } catch (err) {
      console.error("SqlServerEmployeeRepository.getEmployees():", err);
      throw new RepositoryException(
        `Failed to get employees`,
        { cause: err, operation: 'getEmployees' }
      );
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
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(constants.SELECT_EMPLOYEE_SQL);
      if (!result.recordset.length) {
        console.log("SqlServerEmployeeRepository.getEmployee(): no employee found, employee id[%d]", id);
        return undefined;
      }
      console.log("SqlServerEmployeeRepository.getEmployee(): employee id[%d]", id);
      return mappers.mapRowToEmployee(result.recordset[0], true);
    } catch (err) {
      console.error("SqlServerEmployeeRepository.getEmployee():", err);
      throw new RepositoryException(
        `Failed to get employee, employee id[${id}]`,
        { cause: err, operation: 'getEmployee' }
      );
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
        console.log("SqlServerEmployeeRepository.updateEmployee(): " +
          "no employee updated, employee id[%d]", employee.id);
        return;
      }
    } catch (err) {
      console.error("SqlServerEmployeeRepository.updateEmployee():", err);
      throw new RepositoryException(
        `Failed to update employee, employee id[${employee.id}]`,
        { cause: err, operation: 'updateEmployee' }
      );
    }
    console.log("SqlServerEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Deletes an employee by their ID.
   * 
   * @param id - The ID of the employee to be deleted.
   * @returns A promise that resolves when the employee is deleted.
   */
  async deleteEmployee(id: number): Promise<void> {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query(constants.DELETE_EMPLOYEE_SQL);
    } catch (err) {
      console.error("SqlServerEmployeeRepository.deleteEmployee():", err);
      throw new RepositoryException(
        `Failed to delete employee, employee id[${id}]`,
        { cause: err, operation: 'deleteEmployee' }
      );
    }
    console.log("SqlServerEmployeeRepository.deleteEmployee(): employee id[%d]", id);
  }
}
