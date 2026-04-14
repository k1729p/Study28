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
// using Cassandra Query Language
export const CREATE_KEYSPACE_CQL = `
  CREATE KEYSPACE IF NOT EXISTS ${KEYSPACE}
  WITH REPLICATION = {
    'class': 'SimpleStrategy',
    'replication_factor': 1
  }
`;
export const DROP_TABLE_EMPLOYEES_CQL = `DROP TABLE IF EXISTS ${KEYSPACE}.employees`;
export const DROP_TABLE_DEPARTMENTS_CQL = `DROP TABLE IF EXISTS ${KEYSPACE}.departments`;
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
// Primary key columns:
//  - department_id is the partition key
//  - id is the clustering key
// This allows us to efficiently query all employees for a specific department.
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
export const INSERT_DEPARTMENT_CQL = `
  INSERT INTO ${KEYSPACE}.departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
`;
export const INSERT_EMPLOYEE_CQL = `
  INSERT INTO ${KEYSPACE}.employees (
    id, department_id, first_name, last_name, title, phone, mail,
    street_name, house_number, postal_code, locality, province, country
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?
  )
`;
export const CREATE_DEPARTMENT_CQL = `
  INSERT INTO ${KEYSPACE}.departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
`;
export const SELECT_DEPARTMENTS_CQL = `SELECT * FROM ${KEYSPACE}.departments`;
export const SELECT_EMPLOYEES_CQL = `SELECT * FROM ${KEYSPACE}.employees`;

