import { Department } from "../../models/department.js";
import { DepartmentRepository } from "../department.repository.js";
import { RepositoryException } from "../repository-exception.js";
import * as constants from "./chroma.constants.js";
import * as helpers from "./chroma.helpers.js";
import { clientPromise } from "./chroma.pool.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 * Departments are kept in their own Chroma collection, separate from employees.
 */
export class ChromaDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  async createDepartment(department: Department): Promise<void> {
    const client = await clientPromise;
    try {
      const departmentsCollection = await client.getOrCreateCollection(constants.DEPARTMENTS_COLLECTION_OPTIONS);
      await departmentsCollection.upsert({
        ids: [String(department.id)],
        embeddings: [helpers.toPlaceholderEmbedding(department.name)],
        documents: [department.name],
        metadatas: [helpers.toDepartmentMetadata(department)]
      });
    } catch (err) {
      console.error("ChromaDepartmentRepository.createDepartment():", err);
      throw new RepositoryException(
        `Failed to create department, department id[${department.id}]`,
        { cause: err, operation: 'createDepartment' }
      );
    }
    console.log("ChromaDepartmentRepository.createDepartment(): department id[%d]", department.id);
  }

  /**
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const client = await clientPromise;
    try {
      const departmentsCollection = await client.getOrCreateCollection(constants.DEPARTMENTS_COLLECTION_OPTIONS);
      const departmentRows = await departmentsCollection.get();
      const departmentMap = new Map<number, Department>();
      departmentRows.ids.forEach((id: string, index: number) => {
        departmentMap.set(Number(id), helpers.toDepartment(id, departmentRows.metadatas?.[index] ?? {}));
      });
      const employeesCollection = await client.getOrCreateCollection(constants.EMPLOYEES_COLLECTION_OPTIONS);
      const employeeRows = await employeesCollection.get();
      employeeRows.ids.forEach((id: string, index: number) => {
        const metadata = employeeRows.metadatas?.[index] ?? {};
        const department = departmentMap.get(Number(metadata.departmentId));
        if (department) {
          department.employees.push(helpers.toEmployee(id, metadata));
        }
      });
      const departments = Array.from(departmentMap.values()).sort((dep1, dep2) => dep1.id - dep2.id);
      console.log("ChromaDepartmentRepository.getDepartments(): departments count[%d]", departments.length);
      return departments;
    } catch (err) {
      console.error("ChromaDepartmentRepository.getDepartments():", err);
      throw new RepositoryException(
        `Failed to get departments`,
        { cause: err, operation: 'getDepartments' }
      );
    }
  }

  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const client = await clientPromise;
    try {
      const departmentsCollection = await client.getOrCreateCollection(constants.DEPARTMENTS_COLLECTION_OPTIONS);
      const departmentRow = await departmentsCollection.get({ ids: [String(id)] });
      if (departmentRow.ids.length === 0) {
        console.log("ChromaDepartmentRepository.getDepartment(): department not found, department id[%d]", id);
        return undefined;
      }
      const department = helpers.toDepartment(departmentRow.ids[0], departmentRow.metadatas[0]);
      const employeesCollection = await client.getOrCreateCollection(constants.EMPLOYEES_COLLECTION_OPTIONS);
      const employeeRows = await employeesCollection.get({
        where: { [constants.DEPARTMENT_ID_FIELD]: id }
      });
      department.employees = employeeRows.ids
        .map((id, index) => helpers.toEmployee(id, employeeRows.metadatas[index]))
        .sort((emp1, emp2) => emp1.id - emp2.id);
      console.log("ChromaDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("ChromaDepartmentRepository.getDepartment():", err);
      throw new RepositoryException(
        `Failed to get department, department id[${id}]`,
        { cause: err, operation: 'getDepartment' }
      );
    }
  }

  /**
   * Updates an existing department.
   * Only the department's own fields are written here. The employees collection is left untouched.
   * To move an employee to a different department use {@link ChromaEmployeeRepository#updateEmployee} or {@link transferEmployees}.
   *
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateDepartment(department: Department): Promise<void> {
    const client = await clientPromise;
    try {
      const departmentsCollection = await client.getOrCreateCollection(constants.DEPARTMENTS_COLLECTION_OPTIONS);
      const departmentRows = await departmentsCollection.get({ ids: [String(department.id)] });
      if (departmentRows.ids.length === 0) {
        console.log("ChromaDepartmentRepository.updateDepartment(): " +
          "department not updated, department id[%d]", department.id);
        return;
      }
      await departmentsCollection.update({
        ids: [String(department.id)],
        embeddings: [helpers.toPlaceholderEmbedding(department.name)],
        documents: [department.name],
        metadatas: [helpers.toDepartmentMetadata(department)]
      });
    } catch (err) {
      console.error("ChromaDepartmentRepository.updateDepartment():", err);
      throw new RepositoryException(
        `Failed to update department, department id[${department.id}]`,
        { cause: err, operation: 'updateDepartment' }
      );
    }
    console.log("ChromaDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }

  /**
   * Deletes a department by its ID.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    const client = await clientPromise;
    try {
      const employeesCollection = await client.getOrCreateCollection(constants.EMPLOYEES_COLLECTION_OPTIONS);
      await employeesCollection.delete({
        where: { [constants.DEPARTMENT_ID_FIELD]: id }
      });
      const departmentsCollection = await client.getOrCreateCollection(constants.DEPARTMENTS_COLLECTION_OPTIONS);
      await departmentsCollection.delete({ ids: [String(id)] });
    } catch (err) {
      console.error("ChromaDepartmentRepository.deleteDepartment():", err);
      throw new RepositoryException(
        `Failed to delete department, department id[${id}]`,
        { cause: err, operation: 'deleteDepartment' }
      );
    }
    console.log("ChromaDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
}
