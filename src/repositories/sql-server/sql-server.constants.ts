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
// --- DDL: tables ------------------------------------------------------------------------------
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
// --- DDL: table types (used as Table-Valued Parameters by stored procedures) ------------------
export const DROP_TYPE_ID_LIST_SQL = `
  DROP TYPE IF EXISTS dbo.id_list_type
`;
export const CREATE_TYPE_ID_LIST_SQL = `
  CREATE TYPE dbo.id_list_type AS TABLE (
    id INT NOT NULL PRIMARY KEY
  )
`;
// --- DDL: stored procedures ---------------------------------------------------------------------
export const DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL = `
  DROP PROCEDURE IF EXISTS dbo.transfer_employees
`;
export const DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL = `
  DROP PROCEDURE IF EXISTS dbo.delete_department_and_employees
`;
export const CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL = `
  CREATE PROCEDURE dbo.transfer_employees
    @source_department_id INT,
    @target_department_id INT,
    @employee_ids dbo.id_list_type READONLY
  AS
  BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
      BEGIN TRANSACTION;
      UPDATE e
      SET e.department_id = @target_department_id
      FROM employees e
      INNER JOIN @employee_ids ids ON ids.id = e.id
      WHERE e.department_id = @source_department_id;
      COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
      IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;
      THROW;
    END CATCH
  END
`;
export const CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL = `
  CREATE PROCEDURE dbo.delete_department_and_employees
    @department_id INT
  AS
  BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
      BEGIN TRANSACTION;
      DELETE FROM employees
      WHERE department_id = @department_id;
      DELETE FROM departments
      WHERE id = @department_id;
      COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
      IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;
      THROW;
    END CATCH
  END
`;
// --- DML: departments ---------------------------------------------------------------------------
export const INSERT_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id,
    name,
    start_date,
    end_date,
    notes,
    keywords,
    image
  ) VALUES (
    @id,
    @name,
    @startDate,
    @endDate,
    @notes,
    @keywords,
    @image
  )
`;
export const SELECT_DEPARTMENTS_SQL = `
  SELECT 
    d.id, 
    d.name, 
    d.start_date, 
    d.end_date, 
    d.notes, 
    d.keywords, 
    d.image,
    e.id AS employee_id,
    e.department_id,
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
export const SELECT_DEPARTMENT_SQL = SELECT_DEPARTMENTS_SQL + ' WHERE d.id = @id';
export const UPDATE_DEPARTMENT_SQL = `
  UPDATE departments
  SET
    name = @name,
    start_date = @startDate,
    end_date = @endDate,
    notes = @notes,
    keywords = @keywords,
    image = @image
  WHERE id = @id
`;
// --- DML: employees -----------------------------------------------------------------------------
export const INSERT_EMPLOYEE_SQL = `
  INSERT INTO employees (
    id,
    department_id,
    first_name,
    last_name,
    title,
    phone,
    mail,
    street_name,
    house_number,
    postal_code,
    locality,
    province,
    country
  ) VALUES (
    @id,
    @departmentId,
    @firstName,
    @lastName,
    @title,
    @phone,
    @mail, 
    @streetName,
    @houseNumber,
    @postalCode,
    @locality,
    @province,
    @country
  )
`;
export const SELECT_EMPLOYEES_SQL = `
  SELECT
    id,
    department_id,
    first_name,
    last_name,
    title,
    phone,
    mail,
    street_name,
    house_number,
    postal_code,
    locality,
    province,
    country
  FROM employees
`;
export const SELECT_EMPLOYEE_SQL = SELECT_EMPLOYEES_SQL + ' WHERE id = @id';
export const UPDATE_EMPLOYEE_DEPARTMENT_SQL = `
  UPDATE employees
  SET department_id = @departmentId
  WHERE id = @id
`;
export const UPDATE_EMPLOYEE_SQL = `
  UPDATE employees
  SET
    department_id = @departmentId,
    first_name = @firstName,
    last_name = @lastName,
    title = @title,
    phone = @phone,
    mail = @mail,
    street_name = @streetName,
    house_number = @houseNumber,
    postal_code = @postalCode,
    locality = @locality,
    province = @province,
    country = @country
  WHERE id = @id
`;
export const DELETE_EMPLOYEE_SQL = `
  DELETE FROM employees
  WHERE id = @id
`;
// --- DML: stored procedures ---------------------------------------------------------------------
export const EXECUTE_TRANSFER_EMPLOYEES_PROCEDURE = 'dbo.transfer_employees';
export const EXECUTE_DELETE_DEPARTMENT_AND_EMPLOYEES_PROCEDURE = 'dbo.delete_department_and_employees';
