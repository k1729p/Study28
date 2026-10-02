import { config } from "./../../configuration/configuration.js";
/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
  connectString: `${config.oracleHost}:${config.oraclePort}/FREEPDB1`,
  user: config.oracleUser,
  password: config.oraclePassword,
  poolMin: 0,
  poolMax: 10,
  poolTimeout: 60
};
// --- DDL: tables ------------------------------------------------------------------------------
export const DROP_TABLE_EMPLOYEES_SQL = `
  DROP TABLE IF EXISTS employees CASCADE CONSTRAINTS
`;
export const DROP_TABLE_DEPARTMENTS_SQL = `
  DROP TABLE IF EXISTS departments CASCADE CONSTRAINTS
`;
export const CREATE_TABLE_DEPARTMENTS_SQL = `
  CREATE TABLE departments (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(40) NOT NULL,
    start_date DATE,
    end_date DATE,
    notes VARCHAR2(4000),
    keywords VARCHAR2(4000), 
    image VARCHAR2(255)
  )
`;
export const CREATE_TABLE_EMPLOYEES_SQL = `
  CREATE TABLE employees (
    id NUMBER PRIMARY KEY,
    department_id NUMBER REFERENCES departments(id),
    first_name VARCHAR2(40) NOT NULL,
    last_name VARCHAR2(40) NOT NULL,
    title VARCHAR2(40) NOT NULL,
    phone VARCHAR2(30) NOT NULL,
    mail VARCHAR2(80) NOT NULL,
    street_name VARCHAR2(80),
    house_number VARCHAR2(20),
    postal_code VARCHAR2(20),
    locality VARCHAR2(40),
    province VARCHAR2(40),
    country VARCHAR2(40)
  )
`;
// --- DDL: stored procedures ---------------------------------------------------------------------
export const DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL = `
  DROP PROCEDURE IF EXISTS transfer_employees
`;
export const DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL = `
  DROP PROCEDURE IF EXISTS delete_department_and_employees
`;
export const CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL = `
  CREATE OR REPLACE PROCEDURE transfer_employees (
    source_department_id_par IN NUMBER,
    target_department_id_par IN NUMBER,
    employee_ids_par IN SYS.ODCINUMBERLIST
  )
  AS
  BEGIN
    UPDATE employees
    SET department_id = target_department_id_par
    WHERE department_id = source_department_id_par AND id IN (
      SELECT column_value FROM TABLE(employee_ids_par)
    );
  END transfer_employees;
`;
export const CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL = `
  CREATE OR REPLACE PROCEDURE delete_department_and_employees (
    department_id_par IN NUMBER
  )
  AS
  BEGIN
    DELETE FROM employees
    WHERE department_id = department_id_par;
    DELETE FROM departments
    WHERE id = department_id_par;
  END delete_department_and_employees;
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
   :id,
   :name,
   :startDate,
   :endDate,
   :notes,
   :keywords,
   :image
  )
`;
export const SELECT_DEPARTMENTS_SQL = `
  SELECT 
    d.id AS "id", 
    d.name AS "name", 
    d.start_date AS "start_date", 
    d.end_date AS "end_date", 
    d.notes AS "notes", 
    d.keywords AS "keywords", 
    d.image AS "image",
    e.id AS "employee_id",
    e.department_id AS "department_id",
    e.first_name AS "first_name",
    e.last_name AS "last_name",
    e.title AS "title",
    e.phone AS "phone",
    e.mail AS "mail",
    e.street_name AS "street_name",
    e.house_number AS "house_number",
    e.postal_code AS "postal_code",
    e.locality AS "locality",
    e.province AS "province",
    e.country AS "country"
  FROM departments d
  LEFT JOIN employees e ON d.id = e.department_id
`;
export const SELECT_DEPARTMENT_SQL = SELECT_DEPARTMENTS_SQL + 'WHERE d.id = :id';
export const UPDATE_DEPARTMENT_SQL = `
  UPDATE departments
  SET
    name = :name,
    start_date = :startDate,
    end_date = :endDate,
    notes = :notes,
    keywords = :keywords,
    image = :image
  WHERE id = :id
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
    :id,
    :departmentId,
    :firstName,
    :lastName,
    :title,
    :phone,
    :mail, 
    :streetName,
    :houseNumber,
    :postalCode,
    :locality,
    :province,
    :country
  )
`;
export const SELECT_EMPLOYEES_SQL = `
  SELECT
    id AS "id",
    department_id AS "department_id",
    first_name AS "first_name",
    last_name AS "last_name",
    title AS "title",
    phone AS "phone",
    mail AS "mail",
    street_name AS "street_name",
    house_number AS "house_number",
    postal_code AS "postal_code",
    locality AS "locality",
    province AS "province",
    country AS "country"
  FROM employees
`;
export const SELECT_EMPLOYEE_SQL = SELECT_EMPLOYEES_SQL + 'WHERE id = :id';
export const UPDATE_EMPLOYEE_SQL = `
  UPDATE employees
  SET
    department_id = :departmentId,
    first_name = :firstName,
    last_name = :lastName,
    title = :title,
    phone = :phone,
    mail = :mail,
    street_name = :streetName,
    house_number = :houseNumber,
    postal_code = :postalCode,
    locality = :locality,
    province = :province,
    country = :country
  WHERE id = :id
`;
export const UPDATE_EMPLOYEE_DEPARTMENT_SQL = `
  UPDATE employees
  SET department_id = :departmentId
  WHERE id = :id
`;
export const DELETE_EMPLOYEE_SQL = `
  DELETE FROM employees
  WHERE id = :id
`;
// --- DML: stored procedures ---------------------------------------------------------------------
export const CALL_TRANSFER_EMPLOYEES_SQL = `
  BEGIN
  transfer_employees(:sourceDepartmentId, :targetDepartmentId, :employeeIds);
  END;
`;
export const CALL_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL = `
  BEGIN
  delete_department_and_employees(:departmentId);
  END;
`;
