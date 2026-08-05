import { PoolClient, types } from "pg";

import { Department } from "../../models/department.js";
import { poolPromise } from "./postgresql.pool.js";
import { Initialization } from "../initialization.js";
import * as constants from "./postgresql.constants.js";
/**
 * This service class provides methods to initialize database and load data.
 */
export class PostgreSqlInitialization implements Initialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    types.setTypeParser(1082, (val: string) => val);
    const pool = await poolPromise;
    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(constants.DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await client.query(constants.DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      await client.query(constants.DROP_TABLE_EMPLOYEES_SQL);
      await client.query(constants.DROP_TABLE_DEPARTMENTS_SQL);
      await client.query(constants.CREATE_TABLE_DEPARTMENTS_SQL);
      await client.query(constants.CREATE_TABLE_EMPLOYEES_SQL);
      await client.query(constants.CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await client.query(constants.CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      console.log("PostgreSqlInitialization.loadInitialData(): dropped and created tables & procedures");
      if (departments.length > 0) {
        await this.insertDepartments(client, departments);
        await this.insertEmployees(client, departments);
      } else {
        console.warn("PostgreSqlInitialization.loadInitialData(): no departments to insert");
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSqlInitialization.loadInitialData():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSqlInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Inserts the department data into the database.
   * @param client the pool client
   * @param departments the array of departments
   */
  private async insertDepartments(client: PoolClient, departments: Department[]) {
    const values: any[] = [];
    const valuePlaceholders: string[] = [];
    departments.forEach((dep, i) => {
      const startDate = dep.startDate ? dep.startDate : null;
      const endDate = dep.endDate ? dep.endDate : null;
      const idx = i * 7;
      valuePlaceholders.push(
        `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7})`
      );
      values.push(
        dep.id,
        dep.name,
        this.formatDate(startDate),
        this.formatDate(endDate),
        dep.notes ?? null,
        dep.keywords ?? null,
        dep.image ?? null
      );
    });
    const sql = constants.INSERT_DEPARTMENTS_SQL_PREFIX + valuePlaceholders.join(", ");
    try {
      await client.query(sql, values);
    } catch (err) {
      console.error("PostgreSqlInitialization.insertDepartments():", err);
      throw err;
    }
    console.log("PostgreSqlInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee data into the database.
   * @param client the pool client
   * @param departments the array of departments with employees
   */
  private async insertEmployees(client: PoolClient, departments: Department[]) {
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("PostgreSqlInitialization.insertEmployees(): no employees to insert");
      return;
    }
    const values: any[] = [];
    const valuePlaceholders: string[] = [];
    employees.forEach((emp, i) => {
      const idx = i * 13;
      valuePlaceholders.push(
        `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6},
                 $${idx + 7}, $${idx + 8}, $${idx + 9}, $${idx + 10}, $${idx + 11}, $${idx + 12},
                 $${idx + 13})`
      );
      values.push(
        emp.id,
        emp.departmentId,
        emp.firstName,
        emp.lastName,
        emp.title,
        emp.phone,
        emp.mail,
        emp.streetName ?? null,
        emp.houseNumber ?? null,
        emp.postalCode ?? null,
        emp.locality ?? null,
        emp.province ?? null,
        emp.country ?? null
      );
    });
    const sql = constants.INSERT_EMPLOYEES_SQL_PREFIX + valuePlaceholders.join(", ");
    try {
      await client.query(sql, values);
    } catch (err) {
      console.error("PostgreSqlInitialization.insertEmployees():", err);
      throw err;
    }
    console.log("PostgreSqlInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
  /**
   * Formats the date.
   * @param date the date
   * @returns the date
   */
  private formatDate(date: Date | string | null | undefined): string | null {
    if (!date) {
      return null;
    }
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
}