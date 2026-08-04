import { PoolConnection } from "mysql2/promise";

import { Department } from "../../models/department.js";
import { poolPromise } from "./mysql.pool.js";
import { Initialization } from "../initialization.js";
import * as constants from "./mysql.constants.js";
/**
 * This service class provides methods to initialize database and load data.
 */
export class MySqlInitialization implements Initialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    const pool = await poolPromise;
    const connection: PoolConnection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(constants.DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await connection.query(constants.DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      await connection.query(constants.DROP_TABLE_EMPLOYEES_SQL);
      await connection.query(constants.DROP_TABLE_DEPARTMENTS_SQL);
      await connection.query(constants.CREATE_TABLE_DEPARTMENTS_SQL);
      await connection.query(constants.CREATE_TABLE_EMPLOYEES_SQL);
      await connection.query(constants.CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await connection.query(constants.CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      console.log("MySqlInitialization.loadInitialData(): dropped and created tables & procedures");
      if (departments.length > 0) {
        await this.insertDepartments(connection, departments);
        await this.insertEmployees(connection, departments);
      } else {
        console.warn("MySqlInitialization.loadInitialData(): no departments to insert");
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlInitialization.loadInitialData():", err);
      throw err;
    } finally {
      connection.release();
    }
    console.log("MySqlInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Inserts the department data into the database.
   * @param connection the database connection
   * @param departments the array of departments
   */
  private async insertDepartments(connection: PoolConnection, departments: Department[]) {
    for (const dept of departments) {
      const startDate = dept.startDate ? new Date(dept.startDate).toISOString().split('T')[0] : null;
      const endDate = dept.endDate ? new Date(dept.endDate).toISOString().split('T')[0] : null;
      const values = [
        dept.id,
        dept.name,
        startDate,
        endDate,
        dept.notes || null,
        dept.keywords ? dept.keywords.join(',') : null,
        dept.image || null
      ];
      await connection.query(constants.INSERT_DEPARTMENT_SQL, values);
    }
    console.log("MySqlInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee data into the database.
   * @param connection the database connection
   * @param departments the array of departments with employees
   */
  private async insertEmployees(connection: PoolConnection, departments: Department[]) {
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("MySqlInitialization.insertEmployees(): no employees to insert");
      return;
    }
    const values = employees.map(emp => [
      emp.id, emp.departmentId, emp.firstName, emp.lastName, emp.title, emp.phone, emp.mail,
      emp.streetName || null, emp.houseNumber || null, emp.postalCode || null,
      emp.locality || null, emp.province || null, emp.country || null
    ]);
    await connection.query(constants.INSERT_EMPLOYEES_SQL, [values]);
    console.log("MySqlInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}
