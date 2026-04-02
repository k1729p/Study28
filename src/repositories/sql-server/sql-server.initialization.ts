import sql from 'mssql';

import { Department } from "../../models/department.js";
import { poolPromise } from "./sql-server.pool.js";

const DROP_TABLE_EMPLOYEES_SQL = `
  IF OBJECT_ID('employees', 'U') IS NOT NULL 
  DROP TABLE employees
`;
const DROP_TABLE_DEPARTMENTS_SQL = `
  IF OBJECT_ID('departments', 'U') IS NOT NULL 
  DROP TABLE departments
`;
const CREATE_TABLE_DEPARTMENTS_SQL = `
  CREATE TABLE departments (
    id INT PRIMARY KEY,
    name NVARCHAR(40) NOT NULL CHECK (name <> ''),
    start_date DATE,
    end_date DATE,
    notes NVARCHAR(MAX),
    keywords NVARCHAR(MAX),
    image NVARCHAR(255)
  )
`;
const CREATE_TABLE_EMPLOYEES_SQL = `
    CREATE TABLE employees (
      id INT PRIMARY KEY,
      department_id INT FOREIGN KEY REFERENCES departments(id),
      first_name NVARCHAR(40) NOT NULL,
      last_name NVARCHAR(40) NOT NULL,
      title NVARCHAR(40) NOT NULL,
      phone NVARCHAR(30) NOT NULL,
      mail NVARCHAR(80) NOT NULL,
      street_name NVARCHAR(80),
      house_number NVARCHAR(20),
      postal_code NVARCHAR(20),
      locality NVARCHAR(40),
      province NVARCHAR(40),
      country NVARCHAR(40)
    )
`;
const INSERT_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    @id, @name, @startDate, @endDate, @notes, @keywords, @image
  )
`;
const INSERT_EMPLOYEE_SQL = `
  INSERT INTO employees (
    id, department_id, first_name, last_name, title, phone, mail,
    street_name, house_number, postal_code, locality, province, country
  ) VALUES (
    @id, @depId, @fname, @lname, @title, @phone, @mail, 
    @street, @hnum, @pcode, @loc, @prov, @country
  )
`;
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