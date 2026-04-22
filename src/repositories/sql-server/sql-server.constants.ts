import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
  server: config.sqlServerHost,
  port: config.sqlServerPort,
  database: config.sqlServerDatabase,
  user: config.sqlServerUser,
  password: config.sqlServerPassword,
  options: {
    encrypt: false,
    trustServerCertificate: true, // Required for local self-signed certificates in Docker
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};
export const DROP_TABLE_DEPARTMENTS_SQL = `
  IF OBJECT_ID('departments', 'U') IS NOT NULL 
  DROP TABLE departments
`;
export const DROP_TABLE_EMPLOYEES_SQL = `
  IF OBJECT_ID('employees', 'U') IS NOT NULL 
  DROP TABLE employees
`;
export const CREATE_TABLE_DEPARTMENTS_SQL = `
  CREATE TABLE departments (
    id INT PRIMARY KEY,
    name NVARCHAR(40) NOT NULL CHECK (name <> ''),
    start_date DATE,
    end_date DATE,
    notes NVARCHAR(MAX),
    keywords NVARCHAR(450),
    image NVARCHAR(255)
  )
`;
export const CREATE_TABLE_EMPLOYEES_SQL = `
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
export const INSERT_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    @id, @name, @startDate, @endDate, @notes, @keywords, @image
  )
`;
export const INSERT_EMPLOYEE_SQL = `
  INSERT INTO employees (
    id, department_id, first_name, last_name, title, phone, mail,
    street_name, house_number, postal_code, locality, province, country
  ) VALUES (
    @id, @depId, @fname, @lname, @title, @phone, @mail, 
    @street, @hnum, @pcode, @loc, @prov, @country
  )
`;
export const CREATE_DEPARTMENT_SQL = `
  INSERT INTO departments (id, name, start_date, end_date, notes, keywords, image)
  OUTPUT INSERTED.*
  VALUES (@id, @name, @startDate, @endDate, @notes, @keywords, @image)
`;
export const SELECT_DEPARTMENTS_SQL = `
  SELECT 
    d.id AS department_id, 
    d.name AS department_name, 
    d.start_date, 
    d.end_date, 
    d.notes, 
    d.keywords, 
    d.image,
    e.id AS employee_id,
    e.department_id AS employee_department_id,
    e.first_name,
    e.last_name,
    e.title,
    e.phone,
    e.mail,
    e.street_name,
    e.house_number,
    e.postal_code,
    e.locality,
    e.province,
    e.country
  FROM departments d
  LEFT JOIN employees e ON d.id = e.department_id
`;
