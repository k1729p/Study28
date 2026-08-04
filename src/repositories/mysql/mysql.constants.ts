import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
  host: config.mySqlHost,
  port: config.mySqlPort,
  database: config.mySqlDatabase,
  user: config.mySqlUser,
  password: config.mySqlPassword,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  connectTimeout: 30000
};
// --- DDL: tables ------------------------------------------------------------------------------
export const DROP_TABLE_EMPLOYEES_SQL = 'DROP TABLE IF EXISTS employees';
export const DROP_TABLE_DEPARTMENTS_SQL = 'DROP TABLE IF EXISTS departments';
export const CREATE_TABLE_DEPARTMENTS_SQL = `
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
export const CREATE_TABLE_EMPLOYEES_SQL = `
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
// --- DDL: stored procedures ---------------------------------------------------------------------
export const DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL =
  'DROP PROCEDURE IF EXISTS transfer_employees';
export const DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL =
  'DROP PROCEDURE IF EXISTS delete_department_and_employees';
export const CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL = `
  CREATE PROCEDURE transfer_employees (
    IN source_department_id INT,
    IN target_department_id INT,
    IN employee_ids VARCHAR(1000)
  )
  BEGIN
    UPDATE employees
    SET department_id = target_department_id
    WHERE department_id = source_department_id AND FIND_IN_SET(id, employee_ids) > 0;
  END
`;
export const CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL = `
  CREATE PROCEDURE delete_department_and_employees (
    IN department_id_par INT
  )
  BEGIN
    DELETE FROM employees
    WHERE department_id = department_id_par;
    DELETE FROM departments
    WHERE id = department_id_par;
  END
`;
// --- DML: departments ---------------------------------------------------------------------------
export const INSERT_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`;
export const SELECT_DEPARTMENTS_SQL = `
  SELECT 
    d.id AS department_id, d.name AS department_name, d.start_date, d.end_date, 
    d.notes, d.keywords, d.image,
    e.id AS employee_id, e.department_id AS employee_department_id, e.first_name, 
    e.last_name, e.title, e.phone, e.mail, e.street_name, e.house_number, 
    e.postal_code, e.locality, e.province, e.country
  FROM departments d
  LEFT JOIN employees e ON d.id = e.department_id
`;
export const SELECT_DEPARTMENT_SQL = SELECT_DEPARTMENTS_SQL + ' WHERE d.id = ?';
export const UPDATE_DEPARTMENT_SQL = `
  UPDATE departments
  SET name = ?, start_date = ?, end_date = ?, notes = ?, keywords = ?, image = ?
  WHERE id = ?
`;
// --- DML: employees -----------------------------------------------------------------------------
export const INSERT_EMPLOYEES_SQL = `
  INSERT INTO employees (
    id, department_id, first_name, last_name, title, phone, mail, 
    street_name, house_number, postal_code, locality, province, country
  ) VALUES ?
`;    
export const INSERT_EMPLOYEE_SQL = `
  INSERT INTO employees (
    id, department_id, first_name, last_name, title, phone, mail,
    street_name, house_number, postal_code, locality, province, country
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
export const SELECT_EMPLOYEES_SQL = `
  SELECT
    id, department_id, first_name, last_name, title, phone, mail,
    street_name, house_number, postal_code, locality, province, country
  FROM employees
`;
export const SELECT_EMPLOYEE_SQL = SELECT_EMPLOYEES_SQL + ' WHERE id = ?';
export const UPDATE_EMPLOYEE_SQL = `
  UPDATE employees
  SET
    department_id = ?, first_name = ?, last_name = ?, title = ?, phone = ?, mail = ?, street_name = ?,
    house_number = ?, postal_code = ?, locality = ?, province = ?, country = ?
  WHERE id = ?
`;
export const UPDATE_EMPLOYEE_DEPARTMENT_SQL = `
  UPDATE employees
  SET department_id = ?
  WHERE id = ?
`;
export const DELETE_EMPLOYEE_SQL = `
  DELETE FROM employees
  WHERE id = ?
`;
// --- DML: stored procedures ---------------------------------------------------------------------
export const CALL_TRANSFER_EMPLOYEES_SQL = 'CALL transfer_employees(?, ?, ?)';
export const CALL_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL = 'CALL delete_department_and_employees(?)';
