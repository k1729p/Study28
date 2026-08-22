import { config } from "../../configuration/configuration.js";
/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
  contactPoints: [config.cassandraHost],
  localDataCenter: config.cassandraLocalDataCenter,
  socketOptions: {
    readTimeout: 30000,
    connectTimeout: 10000
  }
};
// Keyspaces serve as containers for tables
const KEYSPACE = 'study28';
// CQL: Cassandra Query Language
export const CREATE_KEYSPACE_CQL = `
  CREATE KEYSPACE IF NOT EXISTS ${KEYSPACE}
  WITH REPLICATION = {
    'class': 'SimpleStrategy',
    'replication_factor': 1
  }
`;
// --- DDL: tables --------------------------------------------------------------------------------
export const DROP_TABLE_EMPLOYEES_CQL = `
  DROP TABLE IF EXISTS ${KEYSPACE}.employees
`;
export const DROP_TABLE_DEPARTMENTS_CQL = `
  DROP TABLE IF EXISTS ${KEYSPACE}.departments
`;
// https://cassandra.apache.org/doc/latest/cassandra/developing/cql/ddl.html#create-table-statement
export const CREATE_TABLE_DEPARTMENTS_CQL = `
  CREATE TABLE ${KEYSPACE}.departments (
    id int PRIMARY KEY,
    name text,
    start_date date,
    end_date date,
    notes text,
    keywords list<text>,
    image text
  )
`;
// CQL primary key is composed of two parts: partition key and clustering columns
// Table 'employees' partition key  : 'department_id'
// Table 'employees' clustering key : 'id'
export const CREATE_TABLE_EMPLOYEES_CQL = `
  CREATE TABLE ${KEYSPACE}.employees (
    department_id int,
    id int,
    first_name text,
    last_name text,
    title text,
    phone text,
    mail text,
    street_name text,
    house_number text,
    postal_code text,
    locality text,
    province text,
    country text,
    PRIMARY KEY (department_id, id)
  )
`;
// --- DDL: indexes -------------------------------------------------------------------------------
// The 'employees' table is partitioned by 'department_id', so a lookup by 'id' alone (used by
// getEmployee/updateEmployee/deleteEmployee, which only receive an employee id) cannot use the
// partition key and would otherwise require ALLOW FILTERING, i.e. a full cluster scan.
// A secondary index on 'id' lets Cassandra resolve that single-column lookup efficiently.
// Note: at large, multi-node scale a denormalized "query table" (e.g. an employees_by_id table
// kept in sync on every write) is generally preferred over a secondary index, since indexes
// require a scatter-gather read across the cluster. For this application's scale, a secondary
// index keeps the schema simple while remaining correct and efficient.
export const CREATE_INDEX_EMPLOYEES_ID_CQL = `
  CREATE INDEX IF NOT EXISTS employees_id_idx ON ${KEYSPACE}.employees (id)
`;
// --- DML: departments -----------------------------------------------------------------------------
export const INSERT_DEPARTMENT_CQL = `
  INSERT INTO ${KEYSPACE}.departments (
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
export const SELECT_DEPARTMENTS_CQL = `
  SELECT * FROM ${KEYSPACE}.departments
`;
export const SELECT_DEPARTMENT_CQL = SELECT_DEPARTMENTS_CQL + ' WHERE id = :id';
// 'IF EXISTS' turns the UPDATE into a lightweight transaction (LWT, backed by a Paxos round).
// Without it, CQL's UPDATE silently upserts, i.e. it would happily create a brand-new
// department row if the id did not already exist.
// 'IF EXISTS' makes the statement behave like a genuine 'update or report absence'.
export const UPDATE_DEPARTMENT_CQL = `
  UPDATE ${KEYSPACE}.departments
  SET
    name = :name,
    start_date = :startDate,
    end_date = :endDate,
    notes = :notes,
    keywords = :keywords,
    image = :image
  WHERE id = :id
  IF EXISTS
`;
export const DELETE_DEPARTMENT_CQL = `
  DELETE FROM ${KEYSPACE}.departments WHERE id = :id
`;
// --- DML: employees ---------------------------------------------------------------------------
export const INSERT_EMPLOYEE_CQL = `
  INSERT INTO ${KEYSPACE}.employees (
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
export const SELECT_EMPLOYEES_CQL = `
  SELECT * FROM ${KEYSPACE}.employees
`;
export const SELECT_EMPLOYEES_BY_DEPARTMENT_CQL = SELECT_EMPLOYEES_CQL + ' WHERE department_id = :departmentId';
export const SELECT_EMPLOYEES_BY_DEPARTMENT_AND_IDS_CQL = SELECT_EMPLOYEES_BY_DEPARTMENT_CQL + ' AND id IN :ids';
// Uses the secondary index on 'id' to resolve the partition key ('department_id') that an employee currently belongs to.
export const SELECT_EMPLOYEE_DEPARTMENT_ID_BY_ID_CQL = `
  SELECT department_id FROM ${KEYSPACE}.employees WHERE id = :id
`;
// Uses the secondary index on 'id' to fetch the full employee row by id alone.
export const SELECT_EMPLOYEE_BY_ID_CQL = `
  SELECT * FROM ${KEYSPACE}.employees WHERE id = :id
`;
export const UPDATE_EMPLOYEE_CQL = `
  UPDATE ${KEYSPACE}.employees
  SET
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
  WHERE department_id = :departmentId AND id = :id
`;
export const DELETE_EMPLOYEES_CQL = `
  DELETE FROM ${KEYSPACE}.employees WHERE department_id = :departmentId
`;
export const DELETE_EMPLOYEE_CQL = DELETE_EMPLOYEES_CQL + ' AND id = :id';
