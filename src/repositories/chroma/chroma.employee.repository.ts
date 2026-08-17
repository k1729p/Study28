import { Employee } from "../../models/employee.js";
import { EmployeeRepository } from "../employee.repository.js";
import * as constants from "./chroma.constants.js";
import * as helpers from "./chroma.helpers.js";
import { clientPromise } from "./chroma.pool.js";

/**
 * This service class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 *
 * Employees are kept in their own Chroma collection, separate from departments.
 * Since this application never performs a similarity search over these records,
 * the collection is created with `embeddingFunction: null` and
 * a small deterministic placeholder vector is supplied on every write.
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
      const collection = await client.getOrCreateCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      await collection.upsert({
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
      const employeesCollection = await client.getOrCreateCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
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
      const employeesCollection = await client.getOrCreateCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      const employeeRow = await employeesCollection.get({ ids: [String(id)] });
      if (employeeRow.ids.length === 0) {
        console.log("ChromaEmployeeRepository.getEmployee(): no employee found with id[%d]", id);
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
   *
   * Chroma's `update()` has no equivalent of a SQL "rows affected" count, so an existence
   * check is done first (mirroring the `rowCount` check in the PostgreSQL implementation) to
   * avoid silently creating a record for an id that was never inserted.
   *
   * @param employee the employee to be updated
   * @returns void
   */
  async updateEmployee(employee: Employee): Promise<void> {
    const client = await clientPromise;
    try {
      const collection = await client.getOrCreateCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      const existing = await collection.get({ ids: [String(employee.id)] });
      if (existing.ids.length === 0) {
        console.log("ChromaEmployeeRepository.updateEmployee(): no employee updated with id[%d]", employee.id);
        return;
      }
      await collection.update({
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
   *
   * @param id the id of the employee to be deleted
   * @returns void
   */
  async deleteEmployee(id: number): Promise<void> {
    const client = await clientPromise;
    try {
      const collection = await client.getOrCreateCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      const result = await collection.delete({ ids: [String(id)] });
      console.log("ChromaEmployeeRepository.deleteEmployee(): employee id[%d], deleted count[%d]",
        id, result.deleted ?? 0);
    } catch (err) {
      console.error("ChromaEmployeeRepository.deleteEmployee():", err);
      throw err;
    }
  }
}
