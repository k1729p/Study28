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
export const INSERT_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
`;
export const INSERT_EMPLOYEE_SQL = `
  INSERT INTO employees (
    id, department_id, first_name, last_name, title, phone, mail, 
    street_name, house_number, postal_code, locality, province, country
  ) VALUES ?
`;
export const CREATE_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
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
