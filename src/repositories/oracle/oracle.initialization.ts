import oracledb from 'oracledb';

import { Department } from "../../models/department.js";
import { poolPromise } from "./oracle.pool.js";
import { Initialization } from "../initialization.js";
import {
  DROP_TABLE_EMPLOYEES_SQL, DROP_TABLE_DEPARTMENTS_SQL,
  CREATE_TABLE_DEPARTMENTS_SQL, CREATE_TABLE_EMPLOYEES_SQL,
  INSERT_DEPARTMENT_SQL, INSERT_EMPLOYEE_SQL
} from "./oracle.constants.js";
/**
 * This service class provides methods to initialize database and load data.
 */
export class OracleInitialization implements Initialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.execute(DROP_TABLE_EMPLOYEES_SQL);
      await connection.execute(DROP_TABLE_DEPARTMENTS_SQL);
      await connection.execute(CREATE_TABLE_DEPARTMENTS_SQL);
      await connection.execute(CREATE_TABLE_EMPLOYEES_SQL);
      console.log("OracleInitialization.loadInitialData(): dropped and created tables");
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
    for (const dep of departments) {
      const startDate = dep.startDate ? new Date(dep.startDate) : null;
      const endDate = dep.endDate ? new Date(dep.endDate) : null;
      const bindParams = {
        id: dep.id,
        name: dep.name,
        startDate,
        endDate,
        notes: dep.notes || null,
        keywords: dep.keywords?.join(',') || null,
        image: dep.image || null
      };
      await connection.execute(INSERT_DEPARTMENT_SQL, bindParams, { autoCommit: false });
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
    for (const emp of employees) {
      const bindParams = {
        id: emp.id,
        depId: emp.departmentId,
        fname: emp.firstName,
        lname: emp.lastName,
        title: emp.title,
        phone: emp.phone,
        mail: emp.mail,
        street: emp.streetName || null,
        hnum: emp.houseNumber || null,
        pcode: emp.postalCode || null,
        loc: emp.locality || null,
        prov: emp.province || null,
        country: emp.country || null
      };
      await connection.execute(INSERT_EMPLOYEE_SQL, bindParams, { autoCommit: false });
    }
    console.log("OracleInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}