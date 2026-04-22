import sql from 'mssql';

import { Department } from "../../models/department.js";
import { poolPromise } from "./sql-server.pool.js";
import {
  DROP_TABLE_DEPARTMENTS_SQL,
  DROP_TABLE_EMPLOYEES_SQL,
  CREATE_TABLE_DEPARTMENTS_SQL,
  CREATE_TABLE_EMPLOYEES_SQL,
  INSERT_DEPARTMENT_SQL,
  INSERT_EMPLOYEE_SQL
} from "./sql-server.constants.js";
/**
 * This service class provides methods to initialize database and load data.
 */
export class SQLServerInitialization {
  /**
   * Loads the initial data into database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      await request.query(DROP_TABLE_EMPLOYEES_SQL);
      await request.query(DROP_TABLE_DEPARTMENTS_SQL);
      await request.query(CREATE_TABLE_DEPARTMENTS_SQL);
      await request.query(CREATE_TABLE_EMPLOYEES_SQL);
      console.log("SQLServerInitialization.loadInitialData(): dropped and created tables");
      if (departments.length > 0) {
        await this.insertDepartments(transaction, departments);
        await this.insertEmployees(transaction, departments);
      } else {
        console.warn("SQLServerInitialization.loadInitialData(): no departments to insert");
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error("SQLServerInitialization.loadInitialData():", err);
      throw err;
    }
    console.log("SQLServerInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Inserts the department data into the database.
   * @param transaction the database transaction
   * @param departments the array of departments
   */
  private async insertDepartments(transaction: sql.Transaction, departments: Department[]) {
    for (const dep of departments) {
      const request = new sql.Request(transaction);
      request.input('id', sql.Int, dep.id);
      request.input('name', sql.NVarChar, dep.name);
      request.input('startDate', sql.Date, dep.startDate);
      request.input('endDate', sql.Date, dep.endDate);
      request.input('notes', sql.NVarChar, dep.notes);
      request.input('keywords', sql.NVarChar, dep.keywords?.join(','));
      request.input('image', sql.NVarChar, dep.image);
      await request.query(INSERT_DEPARTMENT_SQL);
    }
    console.log("SQLServerInitialization.insertDepartments(): inserted [%d] departments", departments.length);
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
      console.warn("SQLServerInitialization.insertEmployees(): no employees to insert");
      return;
    }
    for (const emp of employees) {
      const request = new sql.Request(transaction);
      request.input('id', sql.Int, emp.id);
      request.input('depId', sql.Int, emp.departmentId);
      request.input('fname', sql.NVarChar, emp.firstName);
      request.input('lname', sql.NVarChar, emp.lastName);
      request.input('title', sql.NVarChar, emp.title);
      request.input('phone', sql.NVarChar, emp.phone);
      request.input('mail', sql.NVarChar, emp.mail);
      request.input('street', sql.NVarChar, emp.streetName);
      request.input('hnum', sql.NVarChar, emp.houseNumber);
      request.input('pcode', sql.NVarChar, emp.postalCode);
      request.input('loc', sql.NVarChar, emp.locality);
      request.input('prov', sql.NVarChar, emp.province);
      request.input('country', sql.NVarChar, emp.country);
      await request.query(INSERT_EMPLOYEE_SQL);
    }
    console.log("SQLServerInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}