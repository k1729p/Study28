import { PoolClient } from "pg";

import { Department } from "../../models/department.js";
import { poolPromise } from "./postgresql.pool.js";
import {
  DROP_TABLE_EMPLOYEES_SQL, DROP_TABLE_DEPARTMENTS_SQL,
  DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL, DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL,
  CREATE_TABLE_DEPARTMENTS_SQL, CREATE_TABLE_EMPLOYEES_SQL,
  CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL, CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL,
  BULK_INSERT_DEPARTMENTS_SQL_PREFIX, BULK_INSERT_EMPLOYEES_SQL_PREFIX
} from "./postgresql.constants.js";
/**
 * This service class provides methods to initialize database and load data.
 */
export class PostgreSQLInitialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    const pool = await poolPromise;
    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await client.query(DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      await client.query(DROP_TABLE_EMPLOYEES_SQL);
      await client.query(DROP_TABLE_DEPARTMENTS_SQL);
      await client.query(CREATE_TABLE_DEPARTMENTS_SQL);
      await client.query(CREATE_TABLE_EMPLOYEES_SQL);
      console.log("PostgreSQLInitialization.loadInitialData(): dropped and created tables");
      await client.query(CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL);
      await client.query(CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL);
      if (departments.length > 0) {
        await this.insertDepartments(client, departments);
        await this.insertEmployees(client, departments);
      } else {
        console.warn("PostgreSQLInitialization.loadInitialData(): no departments to insert");
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSQLInitialization.loadInitialData():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSQLInitialization.loadInitialData(): data loaded successfully");
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
      const startDate = dep.startDate ? new Date(dep.startDate) : null;
      const endDate = dep.endDate ? new Date(dep.endDate) : null;
      const idx = i * 7;
      valuePlaceholders.push(
        `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7})`
      );
      values.push(
        dep.id,
        dep.name,
        startDate ? startDate.toISOString().split('T')[0] : null,
        endDate ? endDate.toISOString().split('T')[0] : null,
        dep.notes ?? null,
        dep.keywords ?? null,
        dep.image ?? null
      );
    });
    const sql = BULK_INSERT_DEPARTMENTS_SQL_PREFIX + valuePlaceholders.join(", ");
    try {
      await client.query(sql, values);
    } catch (err) {
      console.error("PostgreSQLInitialization.insertDepartments():", err);
      throw err;
    }
    console.log("PostgreSQLInitialization.insertDepartments(): inserted [%d] departments", departments.length);
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
      console.warn("PostgreSQLInitialization.insertEmployees(): no employees to insert");
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
    const sql = BULK_INSERT_EMPLOYEES_SQL_PREFIX + valuePlaceholders.join(", ");
    try {
      await client.query(sql, values);
    } catch (err) {
      console.error("PostgreSQLInitialization.insertEmployees():", err);
      throw err;
    }
    console.log("PostgreSQLInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}