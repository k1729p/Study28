import { Department } from "../../models/department.js";
import { driverPromise } from "./neo4j.pool.js";
import { Initialization } from "../initialization.js";
import * as constants from "./neo4j.constants.js";
/**
 * Repository class providing methods to initialize the database and load seed data.
 */
export class Neo4jInitialization implements Initialization {
  /**
   * Loads initial department data into the database.
   * 
   * @param departments - An array of Department objects to populate.
   * @returns A promise that resolves when data loading is complete.
   */
  async loadInitialData(departments: Department[]): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      await session.executeWrite(transaction => transaction.run(constants.DELETE_QUERY));
      console.log("Neo4jInitialization.loadInitialData(): dropped nodes and relationships");
      if (departments.length > 0) {
        await this.insertDepartments(session, departments);
        await this.insertEmployees(session, departments);
      } else {
        console.warn("Neo4jInitialization.loadInitialData(): no departments to insert");
      }
    } catch (err) {
      console.error("Neo4jInitialization.loadInitialData():", err);
      throw err;
    } finally {
      await session.close();
    }
    console.log("Neo4jInitialization.loadInitialData(): data loaded successfully");
  }
  /**
   * Inserts the department nodes into the database.
   * 
   * @param session the Neo4j session
   * @param departments the array of departments
   */
  private async insertDepartments(session: any, departments: Department[]): Promise<void> {
    const transformedDepartments = departments.map(department => constants.PARAMETERS_FOR_DEPARTMENT(department));
    await session.executeWrite((transaction: any) => transaction.run(
      constants.CREATE_DEPARTMENTS_QUERY, { departments: transformedDepartments }
    ));
    console.log("Neo4jInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee nodes and their relationships into the database.
   * 
   * @param session the Neo4j session
   * @param departments the array of departments with employees
   */
  private async insertEmployees(session: any, departments: Department[]): Promise<void> {
    const employeesFromDepartments = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employeesFromDepartments.length === 0) {
      console.warn("Neo4jInitialization.insertEmployees(): no employees to insert");
      return;
    }
    const transformedEmployees = employeesFromDepartments.map(employee => constants.PARAMETERS_FOR_EMPLOYEE(employee));
    await session.executeWrite((transaction: any) => transaction.run(
      constants.CREATE_EMPLOYEES_QUERY, { employees: transformedEmployees }
    ));
    console.log("Neo4jInitialization.insertEmployees(): inserted [%d] employees", employeesFromDepartments.length);
  }
}