import { Employee } from "../../models/employee.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as constants from "./chroma.constants.js";
import * as helpers from "./chroma.helpers.js";
import { clientPromise } from "./chroma.pool.js";
/**
 * This repository class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 * Employees are kept in their own Chroma collection, separate from departments.
 */
export class ChromaEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * @param employee the employee to be created
   * @return void
   */
  async createEmployee(employee: Employee): Promise<void> {
    const client = await clientPromise;
    try {
      const employeesCollection = await client.getOrCreateCollection(constants.EMPLOYEES_COLLECTION_OPTIONS);
      await employeesCollection.upsert({
        ids: [String(employee.id)],
        embeddings: [helpers.toPlaceholderEmbedding(`${employee.firstName} ${employee.lastName}`)],
        documents: [`${employee.firstName} ${employee.lastName}`],
        metadatas: [helpers.toEmployeeMetadata(employee)]
      });
    } catch (err) {
      console.error("ChromaEmployeeRepository.createEmployee():", err);
      throw err;
    }
    console.log("ChromaEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Gets the employees.
   * @returns an array of Employee objects
   */
  async getEmployees(): Promise<Employee[]> {
    const client = await clientPromise;
    try {
      const employeesCollection = await client.getOrCreateCollection(constants.EMPLOYEES_COLLECTION_OPTIONS);
      const employeeRows = await employeesCollection.get();
      const employees = employeeRows.ids
        .map((id, index) => helpers.toEmployee(id, employeeRows.metadatas[index]))
        .sort((emp1, emp2) => emp1.id - emp2.id);
      console.log("ChromaEmployeeRepository.getEmployees(): employees count[%d]", employees.length);
      return employees;
    } catch (err) {
      console.error("ChromaEmployeeRepository.getEmployees():", err);
      throw err;
    }
  }
  /**
   * Gets the employee by id.
   * @param id the id of the employee to retrieve
   * @returns the Employee object if found, otherwise undefined
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const client = await clientPromise;
    try {
      const employeesCollection = await client.getOrCreateCollection(constants.EMPLOYEES_COLLECTION_OPTIONS);
      const employeeRow = await employeesCollection.get({ ids: [String(id)] });
      if (employeeRow.ids.length === 0) {
        console.log("ChromaEmployeeRepository.getEmployee(): no employee found, employee id[%d]", id);
        return undefined;
      }
      const employee = helpers.toEmployee(employeeRow.ids[0], employeeRow.metadatas[0]);
      console.log("ChromaEmployeeRepository.getEmployee(): employee id[%d]", id);
      return employee;
    } catch (err) {
      console.error("ChromaEmployeeRepository.getEmployee():", err);
      throw err;
    }
  }
  /**
   * Updates an existing employee.
   * @param employee the employee to be updated
   * @returns void
   */
  async updateEmployee(employee: Employee): Promise<void> {
    const client = await clientPromise;
    try {
      const employeesCollection = await client.getOrCreateCollection(constants.EMPLOYEES_COLLECTION_OPTIONS);
      const employeeRows = await employeesCollection.get({ ids: [String(employee.id)] });
      if (employeeRows.ids.length === 0) {
        console.log("ChromaEmployeeRepository.updateEmployee(): no employee updated, employee id[%d]", employee.id);
        return;
      }
      await employeesCollection.update({
        ids: [String(employee.id)],
        embeddings: [helpers.toPlaceholderEmbedding(`${employee.firstName} ${employee.lastName}`)],
        documents: [`${employee.firstName} ${employee.lastName}`],
        metadatas: [helpers.toEmployeeMetadata(employee)]
      });
    } catch (err) {
      console.error("ChromaEmployeeRepository.updateEmployee():", err);
      throw err;
    }
    console.log("ChromaEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
  }
  /**
   * Deletes a employee by its id.
   * @param id the id of the employee to be deleted
   * @returns void
   */
  async deleteEmployee(id: number): Promise<void> {
    const client = await clientPromise;
    try {
      const employeesCollection = await client.getOrCreateCollection(constants.EMPLOYEES_COLLECTION_OPTIONS);
      await employeesCollection.delete({ ids: [String(id)] });
    } catch (err) {
      console.error("ChromaEmployeeRepository.deleteEmployee():", err);
      throw err;
    }
    console.log("ChromaEmployeeRepository.deleteEmployee(): employee id[%d]");
  }
}
