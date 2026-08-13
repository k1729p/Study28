import { Client, mapping } from 'cassandra-driver';
import { Department } from "../../models/department.js";
import { clientPromise } from "./cassandra.pool.js";
import { Initialization } from "../initialization.js";
import * as constants from "./cassandra.constants.js";
/**
 * This service class provides methods to initialize the database and load data.
 */
export class CassandraInitialization implements Initialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]) {
    try {
      const client = await clientPromise;
      await client.execute(constants.CREATE_KEYSPACE_CQL);
      await client.execute(constants.DROP_TABLE_EMPLOYEES_CQL);
      await client.execute(constants.DROP_TABLE_DEPARTMENTS_CQL);
      await client.execute(constants.CREATE_TABLE_DEPARTMENTS_CQL);
      await client.execute(constants.CREATE_TABLE_EMPLOYEES_CQL);
      await client.execute(constants.CREATE_INDEX_EMPLOYEES_ID_CQL);
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
    let THE_FLAG = true;
    if(THE_FLAG) {
      for (const department of departments) {
        await client.execute(constants.INSERT_DEPARTMENT_CQL,
          constants.PARAMETERS_FOR_DEPARTMENT(department), { prepare: true });
      }
    } else {
    // #############################################################################################################
      const mapper = new mapping.Mapper(client, constants.mappingOptions);
      const departmentMapper = mapper.forModel<Department>('Department');
      for (const department of departments) {
        const departmentData = {
          id: department.id,
          name: department.name,
          startDate: department.startDate ? new Date(department.startDate).toISOString().split('T')[0] : null,
          endDate: department.endDate ? new Date(department.endDate).toISOString().split('T')[0] : null,
          notes: department.notes || null,
          keywords: department.keywords || null,
          image: department.image || null
        };
        await departmentMapper.insert(departmentData);
      }
    // #############################################################################################################
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
    for (const employee of employees) {
      await client.execute(constants.INSERT_EMPLOYEE_CQL,
        constants.PARAMETERS_FOR_EMPLOYEE(employee), { prepare: true });
    }
    console.log("CassandraInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}
