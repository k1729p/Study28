import { Department } from "../../models/department.js";
import { driverPromise } from "./neo4j.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import * as constants from "./neo4j.constants.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export class Neo4jDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  async createDepartment(department: Department): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      await session.executeWrite(transaction => transaction.run(
        constants.CREATE_DEPARTMENT_QUERY, constants.PARAMETERS_FOR_DEPARTMENT(department)));
    } catch (err) {
      console.error("Neo4jDepartmentRepository.createDepartment():", err);
      throw err;
    } finally {
      await session.close();
    }
    console.log("Neo4jDepartmentRepository.createDepartment(): department id[%d]", department.id);
  }
  /**
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeRead(transaction => transaction.run(constants.READ_DEPARTMENTS_QUERY));
      const departments = result.records.map(record => constants.RECORD_TO_DEPARTMENT(record));
      console.log("Neo4jDepartmentRepository.getDepartments(): departments count[%d]", departments.length);
      return departments;
    } catch (err) {
      console.error("Neo4jDepartmentRepository.getDepartments():", err);
      throw err;
    } finally {
      await session.close();
    }
  }
  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeRead(transaction => transaction.run(constants.READ_DEPARTMENT_QUERY, { id }));
      if (result.records.length === 0) {
        console.log("Neo4jDepartmentRepository.getDepartment(): department not found, department id[%d]", id);
        return undefined;
      }
      const department = constants.RECORD_TO_DEPARTMENT(result.records[0]);
      console.log("Neo4jDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("Neo4jDepartmentRepository.getDepartment():", err);
      throw err;
    } finally {
      await session.close();
    }
  }
  /**
   * Updates an existing department.
   * Only the Department node's own properties (name, dates, notes, keywords, image) are updated.
   * 
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateDepartment(department: Department): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeWrite(transaction => transaction.run(
        constants.UPDATE_DEPARTMENT_QUERY, constants.PARAMETERS_FOR_DEPARTMENT(department)));
      if (result.records.length === 0) {
        console.log("Neo4jDepartmentRepository.updateDepartment(): " +
          "department not updated, department id[%d]", department.id);
        return;
      }
    } catch (err) {
      console.error("Neo4jDepartmentRepository.updateDepartment():", err);
      throw err;
    } finally {
      await session.close();
    }
    console.log("Neo4jDepartmentRepository.updateDepartment() department id[%d]", department.id);
  }
  /**
   * Deletes a department by its ID, together with every employee that works in it (cascading delete).
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeWrite(transaction => transaction.run(constants.DELETE_DEPARTMENT_QUERY, { id }));
      if (result.summary.counters.updates().nodesDeleted === 0) {
        console.log("Neo4jDepartmentRepository.deleteDepartment(): department not found, department id[%d]", id);
        return;
      }
    } catch (err) {
      console.error("Neo4jDepartmentRepository.deleteDepartment():", err);
      throw err;
    } finally {
      await session.close();
    }
    console.log("Neo4jDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers employees from a source department to a target department.
   *
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    if (employeeIds.length === 0) {
      console.warn("Neo4jDepartmentRepository.transferEmployees(): no employee ids provided, nothing to transfer");
      return;
    }
    const driver = await driverPromise;
    const session = driver.session();
    let transferredCount = 0;
    try {
      const result = await session.executeWrite(transaction => transaction.run(
        constants.TRANSFER_EMPLOYEES_QUERY,
        { sourceDepartmentId, targetDepartmentId, employeeIds }
      ));
      transferredCount = result.records.length;
    } catch (err) {
      console.error("Neo4jDepartmentRepository.transferEmployees():", err);
      throw err;
    } finally {
      await session.close();
    }
    console.log("Neo4jDepartmentRepository.transferEmployees(): " +
      "source department id[%d], target department id[%d], transferred employees count[%d]",
      sourceDepartmentId, targetDepartmentId, transferredCount);
  }
}
