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
export const DROP_TABLE_EMPLOYEES_SQL = `DROP TABLE IF EXISTS employees CASCADE CONSTRAINTS`;
export const DROP_TABLE_DEPARTMENTS_SQL = `DROP TABLE IF EXISTS departments CASCADE CONSTRAINTS`;
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
export const INSERT_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
   :id, :name, :startDate, :endDate, :notes, :keywords, :image
  )
`;
export const INSERT_EMPLOYEE_SQL = `
  INSERT INTO employees (
    id, department_id, first_name, last_name, title, phone, mail,
    street_name, house_number, postal_code, locality, province, country
  ) VALUES (
    :id, :depId, :fname, :lname, :title, :phone, :mail, 
    :street, :hnum, :pcode, :loc, :prov, :country
  )
`;
export const CREATE_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
   :id, :name, :startDate, :endDate, :notes, :keywords, :image
  )
`;
export const SELECT_DEPARTMENTS_SQL = `
  SELECT 
    d.id AS "department_id", 
    d.name AS "department_name", 
    d.start_date AS "start_date", 
    d.end_date AS "end_date", 
    d.notes AS "notes", 
    d.keywords AS "keywords", 
    d.image AS "image",
    e.id AS "employee_id",
    e.department_id AS "employee_department_id",
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
