import oracledb from 'oracledb';

import { Department } from "../../models/department.js";
import { poolPromise } from "./oracle.pool.js";
import { Initialization } from "../initialization.js";
import * as constants from "./oracle.constants.js";
/**
 * Repository class providing methods to initialize the database and load seed data.
 */
export class OracleInitialization implements Initialization {
  /**
   * Loads initial department data into the database.
   * 
   * @param departments - An array of Department objects to populate.
   * @returns A promise that resolves when data loading is complete.
   */
  async loadInitialData(departments: Department[]) {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.execute(constants.DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await connection.execute(constants.DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      await connection.execute(constants.DROP_TABLE_EMPLOYEES_SQL);
      await connection.execute(constants.DROP_TABLE_DEPARTMENTS_SQL);
      await connection.execute(constants.CREATE_TABLE_DEPARTMENTS_SQL);
      await connection.execute(constants.CREATE_TABLE_EMPLOYEES_SQL);
      await connection.execute(constants.CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await connection.execute(constants.CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      console.log("OracleInitialization.loadInitialData(): dropped and created tables & procedures");
      if (departments.length > 0) {
        await this.insertDepartments(connection, departments);
        await this.insertEmployees(connection, departments);
      } else {
        console.warn("OracleInitialization.loadInitialData(): no departments to insert");
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("OracleInitialization.loadInitialData():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleInitialization.loadInitialData(): error closing connection", err);
      }
    }
    console.log("OracleInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Inserts the department data into the database.
   * @param connection the database connection
   * @param departments the array of departments
   */
  private async insertDepartments(connection: oracledb.Connection, departments: Department[]) {
    for (const department of departments) {
      await connection.execute(constants.INSERT_DEPARTMENT_SQL, constants.BIND_PARAMETERS_FOR_DEPARTMENT(department), { autoCommit: false });
    }
    console.log("OracleInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee data into the database.
   * @param connection the database connection
   * @param departments the array of departments with employees
   */
  private async insertEmployees(connection: oracledb.Connection, departments: Department[]) {
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("OracleInitialization.insertEmployees(): no employees to insert");
      return;
    }
    for (const employee of employees) {
      await connection.execute(constants.INSERT_EMPLOYEE_SQL, constants.BIND_PARAMETERS_FOR_EMPLOYEE(employee), { autoCommit: false });
    }
    console.log("OracleInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}
