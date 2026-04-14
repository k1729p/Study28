import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
  host: config.postgreSqlHost,
  port: config.postgreSqlPort,
  database: config.postgreSqlDatabase,
  user: config.postgreSqlUser,
  password: config.postgreSqlPassword,
};
export const DROP_TABLE_EMPLOYEES_SQL = 'DROP TABLE IF EXISTS employees';
export const DROP_TABLE_DEPARTMENTS_SQL = 'DROP TABLE IF EXISTS departments';
export const DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL = 'DROP PROCEDURE IF EXISTS transfer_employees';
export const DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL =
  'DROP PROCEDURE IF EXISTS delete_department_and_employees';
export const CREATE_TABLE_DEPARTMENTS_SQL = `
    CREATE TABLE departments (
        id integer PRIMARY KEY,
        name varchar(40) NOT NULL CHECK (name <> ''),
        start_date date,
        end_date date,
        notes text,
        keywords text[],
        image varchar(255)
    )
`;
export const CREATE_TABLE_EMPLOYEES_SQL = `
    CREATE TABLE employees (
        id integer PRIMARY KEY,
        department_id integer REFERENCES departments(id),
        first_name varchar(40) NOT NULL,
        last_name varchar(40) NOT NULL,
        title varchar(40) NOT NULL,
        phone varchar(30) NOT NULL,
        mail varchar(80) NOT NULL,
        street_name varchar(80),
        house_number varchar(20),
        postal_code varchar(20),
        locality varchar(40),
        province varchar(40),
        country varchar(40)
    )
`;
export const CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL = `
    CREATE OR REPLACE PROCEDURE transfer_employees (
        source_department_id integer,
        target_department_id integer,
        employee_ids integer[]
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
        UPDATE employees
        SET department_id = target_department_id
        WHERE department_id = source_department_id AND id = ANY(employee_ids);
    END;
    $$;
`;
export const CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL = `
    CREATE OR REPLACE PROCEDURE delete_department_and_employees (
        dep_id integer
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
        DELETE FROM employees
        WHERE department_id = dep_id;
        DELETE FROM departments
        WHERE id = dep_id;
    END;
    $$;
`;
export const BULK_INSERT_DEPARTMENTS_SQL_PREFIX = `
    INSERT INTO departments (
        id, name, start_date, end_date, notes, keywords, image
    ) VALUES
`;
export const BULK_INSERT_EMPLOYEES_SQL_PREFIX = `
    INSERT INTO employees (
        id, department_id, first_name, last_name, title, phone, mail,
        street_name, house_number, postal_code, locality, province, country
    ) VALUES
`;

export const CREATE_DEPARTMENT_SQL = `
  INSERT INTO departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7
  )
  RETURNING *
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
export const SELECT_DEPARTMENT_SQL = SELECT_DEPARTMENTS_SQL + 'WHERE d.id = $1';
export const UPDATE_DEPARTMENT_SQL = `
  UPDATE departments
  SET name = $1, start_date = $2, end_date = $3, notes = $4, keywords = $5, image = $6
  WHERE id = $7
  RETURNING *
`;
export const UPDATE_EMPLOYEE_DEPARTMENT_SQL = `
  UPDATE employees
  SET department_id = $1
  WHERE id = $2
  RETURNING *
`;
export const CREATE_EMPLOYEE_SQL = `
    INSERT INTO employees (
    id, department_id, first_name, last_name, title, phone, mail,
    street_name, house_number, postal_code, locality, province, country
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
`;
export const SELECT_EMPLOYEES_SQL = `
    SELECT
    id, department_id, first_name, last_name, title, phone, mail,
    street_name, house_number, postal_code, locality, province, country
    FROM employees
`;
export const SELECT_EMPLOYEE_SQL = SELECT_EMPLOYEES_SQL + ' WHERE id = $1';
export const UPDATE_EMPLOYEE_SQL = `
    UPDATE employees
    SET
    department_id = $1, first_name = $2, last_name = $3, title = $4, phone = $5, mail = $6, street_name = $7,
    house_number = $8, postal_code = $9, locality = $10, province = $11, country = $12
    WHERE id = $13
    RETURNING *
`;
export const DELETE_EMPLOYEE_SQL = `
    DELETE FROM employees
    WHERE id = $1
`;
