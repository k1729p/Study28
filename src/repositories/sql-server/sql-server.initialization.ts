import sql from 'mssql';

import { Department } from "../../models/department.js";
import { Initialization } from "../initialization.js";
import { poolPromise } from "./sql-server.pool.js";
import * as constants from "./sql-server.constants.js";
/**
 * Repository class providing methods to initialize the database and load seed data.
 */
export class SqlServerInitialization implements Initialization {
  /**
   * Loads initial department data into the database.
   * 
   * @param departments - An array of Department objects to populate.
   * @returns A promise that resolves when data loading is complete.
   */
  async loadInitialData(departments: Department[]) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      await request.query(constants.DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await request.query(constants.DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      await request.query(constants.DROP_TYPE_ID_LIST_SQL);
      await request.query(constants.DROP_TABLE_EMPLOYEES_SQL);
      await request.query(constants.DROP_TABLE_DEPARTMENTS_SQL);
      await request.query(constants.CREATE_TABLE_DEPARTMENTS_SQL);
      await request.query(constants.CREATE_TABLE_EMPLOYEES_SQL);
      await request.query(constants.CREATE_TYPE_ID_LIST_SQL);
      await request.query(constants.CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await request.query(constants.CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      console.log("SqlServerInitialization.loadInitialData(): dropped and created tables, type & procedures");
      if (departments.length > 0) {
        await this.insertDepartments(transaction, departments);
        await this.insertEmployees(transaction, departments);
      } else {
        console.warn("SqlServerInitialization.loadInitialData(): no departments to insert");
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error("SqlServerInitialization.loadInitialData():", err);
      throw err;
    }
    console.log("SqlServerInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Inserts the department data into the database.
   * @param transaction the database transaction
   * @param departments the array of departments
   */
  private async insertDepartments(transaction: sql.Transaction, departments: Department[]) {
    for (const department of departments) {
      await new sql.Request(transaction)
        .input('id', sql.Int, department.id)
        .input('name', sql.NVarChar, department.name)
        .input('startDate', sql.Date, department.startDate)
        .input('endDate', sql.Date, department.endDate)
        .input('notes', sql.NVarChar, department.notes)
        .input('keywords', sql.NVarChar, department.keywords?.join(','))
        .input('image', sql.NVarChar, department.image)
        .query(constants.INSERT_DEPARTMENT_SQL);
    }
    console.log("SqlServerInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee data into the database.
   * @param transaction the database transaction
   * @param departments the array of departments with employees
   */
  private async insertEmployees(transaction: sql.Transaction, departments: Department[]) {
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("SqlServerInitialization.insertEmployees(): no employees to insert");
      return;
    }
    for (const employee of employees) {
      await new sql.Request(transaction)
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
    }
    console.log("SqlServerInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}
