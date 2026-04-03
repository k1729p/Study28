import { Department } from "../../models/department.js";
import { poolPromise } from "./mysql.pool.js";

const DROP_TABLE_EMPLOYEES_SQL = 'DROP TABLE IF EXISTS employees';
const DROP_TABLE_DEPARTMENTS_SQL = 'DROP TABLE IF EXISTS departments';
const CREATE_TABLE_DEPARTMENTS_SQL = `
  CREATE TABLE departments (
    id INT PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    keywords TEXT,
    image VARCHAR(255)
  )
`;
const CREATE_TABLE_EMPLOYEES_SQL = `
  CREATE TABLE employees (
    id INT PRIMARY KEY,
    department_id INT,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    title VARCHAR(40) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    mail VARCHAR(80) NOT NULL,
    street_name VARCHAR(80),
    house_number VARCHAR(20),
    postal_code VARCHAR(20),
    locality VARCHAR(40),
    province VARCHAR(40),
    country VARCHAR(40),
    FOREIGN KEY (department_id) REFERENCES departments(id)
  )
`;
const INSERT_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
`;
const INSERT_EMPLOYEE_SQL = `
  INSERT INTO employees (
    id, department_id, first_name, last_name, title, phone, mail, 
    street_name, house_number, postal_code, locality, province, country
  ) VALUES ?
`;
/**
 * This service class provides methods to initialize database and load data.
 */
export class MySQLInitialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(DROP_TABLE_EMPLOYEES_SQL);
      await connection.query(DROP_TABLE_DEPARTMENTS_SQL);
      await connection.query(CREATE_TABLE_DEPARTMENTS_SQL);
      await connection.query(CREATE_TABLE_EMPLOYEES_SQL);
      console.log("MySQLInitialization.loadInitialData(): dropped and created tables");
      if (departments.length > 0) {
        await this.insertDepartments(connection, departments);
        await this.insertEmployees(connection, departments);
      } else {
        console.warn("MySQLInitialization.loadInitialData(): no departments to insert");
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySQLInitialization.loadInitialData():", err);
      throw err;
    } finally {
      connection.release();
    }
    console.log("MySQLInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Inserts the department data into the database.
   * @param connection the database connection
   * @param departments the array of departments
   */
  private async insertDepartments(connection: any, departments: Department[]) {
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
      await connection.query(INSERT_DEPARTMENT_SQL, values);
    }
    console.log("MySQLInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee data into the database.
   * @param connection the database connection
   * @param departments the array of departments with employees
   */
  private async insertEmployees(connection: any, departments: Department[]) {
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("MySQLInitialization.insertEmployees(): no employees to insert");
      return;
    }
    const values = employees.map(emp => [
      emp.id, emp.departmentId, emp.firstName, emp.lastName, emp.title, emp.phone, emp.mail,
      emp.streetName || null, emp.houseNumber || null, emp.postalCode || null,
      emp.locality || null, emp.province || null, emp.country || null
    ]);
    await connection.query(INSERT_EMPLOYEE_SQL, [values]);
    console.log("MySQLInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}