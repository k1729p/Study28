import { Employee } from "../../models/employee.js";
import { driverPromise } from "./neo4j.pool.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as constants from "./neo4j.constants.js";
/**
 * Repository interface providing methods to manage employees.
 * Includes CRUD operations to create, read, update, and delete employees.
 */
export class Neo4jEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee and connects it to its department via the WORKS_IN relationship.
   * The department is matched explicitly by CREATE_EMPLOYEE_QUERY.
   * If it does not exist, no employee node is created.
   * 
   * @param employee - The employee to be created.
   * @returns A promise that resolves when the employee is created.
   */
  async createEmployee(employee: Employee): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeWrite(transaction => transaction.run(
        constants.CREATE_EMPLOYEE_QUERY, constants.PARAMETERS_FOR_EMPLOYEE(employee)));
      if (result.records.length === 0) {
        console.log("Neo4jEmployeeRepository.createEmployee(): " +
          "employee not created, department not found, employee id[%d], department id[%d]",
          employee.id, employee.departmentId);
        return;
      }
    } catch (err) {
      console.error("Neo4jEmployeeRepository.createEmployee():", err);
      throw err;
    } finally {
      await session.close();
    }
    console.log("Neo4jEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Retrieves all employees, ordered by id.
   * 
   * @returns A promise that resolves to an array of Employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeRead(transaction => transaction.run(constants.READ_EMPLOYEES_QUERY));
      const employees = result.records.map(record => constants.NODE_TO_EMPLOYEE(record.get('employee')));
      console.log("Neo4jEmployeeRepository.getEmployees(): employees count[%d]", employees.length);
      return employees;
    } catch (err) {
      console.error("Neo4jEmployeeRepository.getEmployees():", err);
      throw err;
    } finally {
      await session.close();
    }
  }
  /**
   * Retrieves an employee by their ID.
   * 
   * @param id - The ID of the employee to retrieve.
   * @returns A promise that resolves to the Employee object if found, otherwise undefined.
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeRead(transaction => transaction.run(constants.READ_EMPLOYEE_QUERY, { id }));
      if (result.records.length === 0) {
        console.log("Neo4jEmployeeRepository.getEmployee(): employee not found, employee id[%d]", id);
        return undefined;
      }
      const employee = constants.NODE_TO_EMPLOYEE(result.records[0].get('employee'));
      console.log("Neo4jEmployeeRepository.getEmployee() employee id[%d]", id);
      return employee;
    } catch (err) {
      console.error("Neo4jEmployeeRepository.getEmployee():", err);
      throw err;
    } finally {
      await session.close();
    }
  }
  /**
   * Updates an existing employee, moving it to a different department when
   * employee.departmentId has changed. Both the employee and the (possibly new)
   * department are matched up front, so if either is missing no write is performed.
   * The WORKS_IN relationship is replaced so the graph stays consistent with the
   * denormalized 'departmentId' property.
   * 
   * @param employee - The employee object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateEmployee(employee: Employee): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeWrite(transaction => transaction.run(
        constants.UPDATE_EMPLOYEE_QUERY, constants.PARAMETERS_FOR_EMPLOYEE(employee)));
      if (result.records.length === 0) {
        console.log("Neo4jEmployeeRepository.updateEmployee(): " +
          "employee not updated, employee id[%d]", employee.id);
        return;
      }
    } catch (err) {
      console.error("Neo4jEmployeeRepository.updateEmployee():", err);
      throw err;
    } finally {
      await session.close();
    }
    console.log("Neo4jEmployeeRepository.updateEmployee() employee id[%d]", employee.id);
  }
  /**
   * Deletes an employee by their ID, along with its WORKS_IN relationship.
   * 
   * @param id - The ID of the employee to be deleted.
   * @returns A promise that resolves when the employee is deleted.
   */
  async deleteEmployee(id: number): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeWrite(transaction => transaction.run(constants.DELETE_EMPLOYEE_QUERY, { id }));
      if (result.summary.counters.updates().nodesDeleted) {
        console.log("Neo4jEmployeeRepository.deleteEmployee(): employee not found, employee id[%d]", id);
        return;
      }
    } catch (err) {
      console.error("Neo4jEmployeeRepository.deleteEmployee():", err);
      throw err;
    } finally {
      await session.close();
    }
    console.log("Neo4jEmployeeRepository.deleteEmployee() employee id[%d]", id);
  }
}
