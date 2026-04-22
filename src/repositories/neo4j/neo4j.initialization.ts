import { Department } from "../../models/department.js";
import { driverPromise } from "./neo4j.pool.js";
import {
  DELETE_QUERY, CREATE_DEPARTMENTS_QUERY, CREATE_EMPLOYEES_QUERY
} from "./neo4j.constants.js";
/**
 * This service class provides methods to initialize database and load data.
 */
export class Neo4jInitialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  async loadInitialData(departments: Department[]): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      await session.executeWrite(transaction => transaction.run(DELETE_QUERY));
      console.log("Neo4jInitialization.loadInitialData(): dropped existing nodes and relationships");
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
   * @param session the Neo4j session
   * @param departments the array of departments
   */
  private async insertDepartments(session: any, departments: Department[]): Promise<void> {
    const departmentData = departments.map(department => ({
      id: department.id,
      name: department.name,
      startDate: department.startDate ? new Date(department.startDate).toISOString().split('T')[0] : null,
      endDate: department.endDate ? new Date(department.endDate).toISOString().split('T')[0] : null,
      notes: department.notes || null,
      keywords: department.keywords ? department.keywords.join(',') : null,
      image: department.image || null
    }));
    await session.executeWrite((transaction: any) => transaction.run(
      CREATE_DEPARTMENTS_QUERY, { departments: departmentData }
    ));
    console.log("Neo4jInitialization.insertDepartments(): inserted [%d] departments", departments.length);
  }
  /**
   * Inserts the employee nodes and their relationships into the database.
   * @param session the Neo4j session
   * @param departments the array of departments with employees
   */
  private async insertEmployees(session: any, departments: Department[]): Promise<void> {
    const employees = departments.flatMap(dep =>
      dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
    );
    if (employees.length === 0) {
      console.warn("Neo4jInitialization.insertEmployees(): no employees to insert");
      return;
    }
    const employeeData = employees.map(employee => ({
      id: employee.id,
      departmentId: employee.departmentId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      title: employee.title,
      phone: employee.phone,
      mail: employee.mail,
      streetName: employee.streetName || null,
      houseNumber: employee.houseNumber || null,
      postalCode: employee.postalCode || null,
      locality: employee.locality || null,
      province: employee.province || null,
      country: employee.country || null
    }));
    await session.executeWrite((transaction: any) => transaction.run(
      CREATE_EMPLOYEES_QUERY, { employees: employeeData }
    ));
    console.log("Neo4jInitialization.insertEmployees(): inserted [%d] employees", employees.length);
  }
}