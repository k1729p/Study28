import { Department } from "../../models/department.js";
import { clientPromise } from "./cassandra.pool.js";
// Keyspaces serve as containers for tables
const KEYSPACE = 'study28';
// using Cassandra Query Language
const CREATE_KEYSPACE_CQL = `
  CREATE KEYSPACE IF NOT EXISTS ${KEYSPACE}
  WITH REPLICATION = {
    'class': 'SimpleStrategy',
    'replication_factor': 1
  }
`;
const DROP_TABLE_EMPLOYEES_CQL = `DROP TABLE IF EXISTS ${KEYSPACE}.employees`;
const DROP_TABLE_DEPARTMENTS_CQL = `DROP TABLE IF EXISTS ${KEYSPACE}.departments`;
const CREATE_TABLE_DEPARTMENTS_CQL = `
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
const CREATE_TABLE_EMPLOYEES_CQL = `
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
const INSERT_DEPARTMENT_CQL = `
  INSERT INTO ${KEYSPACE}.departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
`;
const INSERT_EMPLOYEE_CQL = `
  INSERT INTO ${KEYSPACE}.employees (
    id, department_id, first_name, last_name, title, phone, mail,
    street_name, house_number, postal_code, locality, province, country
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?
  )
`;
/**
 * This service class provides methods to initialize the database and load data.
 */
export class CassandraInitialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    try {
      const client = await clientPromise;
      await client.execute(CREATE_KEYSPACE_CQL);
      await client.execute(DROP_TABLE_EMPLOYEES_CQL);
      await client.execute(DROP_TABLE_DEPARTMENTS_CQL);
      await client.execute(CREATE_TABLE_DEPARTMENTS_CQL);
      await client.execute(CREATE_TABLE_EMPLOYEES_CQL);
      console.log("CassandraInitialization.loadInitialData(): dropped and created tables");
      if (departments.length > 0) {
        await this.insertDepartments(client, departments);
        await this.insertEmployees(client, departments);
      } else {
        console.warn("CassandraInitialization.loadInitialData(): no departments to insert");
      }
    } catch (err) {
      console.error("CassandraInitialization.loadInitialData():", err);
      throw err;
    }
    console.log("CassandraInitialization.loadInitialData(): data loaded successfully");
  }

  /**
   * Inserts the department data into the database.
   * @param client the Cassandra client
   * @param departments the array of departments
   */
  private async insertDepartments(client: any, departments: Department[]) {
    for (const dept of departments) {
      const startDate = dept.startDate ? new Date(dept.startDate).toISOString().split('T')[0] : null;
      const endDate = dept.endDate ? new Date(dept.endDate).toISOString().split('T')[0] : null;
      const values = [
        dept.id, dept.name,
        startDate, endDate,
        dept.notes || null, dept.keywords || null, dept.image || null
      ];
      await client.execute(INSERT_DEPARTMENT_CQL, values, { prepare: true });
    }
    console.log("CassandraInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }

  /**
   * Inserts the employee data into the database.
   * @param client the Cassandra client
   * @param departments the array of departments with employees
   */
  private async insertEmployees(client: any, departments: Department[]) {
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("CassandraInitialization.insertEmployees(): no employees to insert");
      return;
    }
    for (const emp of employees) {
      const values = [
        emp.id, emp.departmentId, emp.firstName, emp.lastName,
        emp.title, emp.phone, emp.mail,
        emp.streetName || null, emp.houseNumber || null, emp.postalCode || null,
        emp.locality || null, emp.province || null, emp.country || null
      ];
      await client.execute(INSERT_EMPLOYEE_CQL, values, { prepare: true });
    }
    console.log("CassandraInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}