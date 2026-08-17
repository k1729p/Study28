import type { Metadata } from "chromadb";

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { DepartmentRepository } from "../department.repository.js";
import * as constants from "./chroma.constants.js";
import * as helpers from "./chroma.helpers.js";
import { clientPromise } from "./chroma.pool.js";

/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 *
 * Departments are kept in their own Chroma collection, separate from employees.
 * Since this application never performs a similarity search over these records,
 * the collection is created with `embeddingFunction: null` and
 * a small deterministic placeholder vector is supplied on every write.
 */
export class ChromaDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(department: Department): Promise<void> {
    const client = await clientPromise;
    try {
      const collection = await client.getOrCreateCollection({
        name: constants.DEPARTMENTS_COLLECTION,
        embeddingFunction: null
      });
      await collection.upsert({
        ids: [String(department.id)],
        embeddings: [helpers.toPlaceholderEmbedding(department.name)],
        documents: [department.name],
        metadatas: [helpers.toDepartmentMetadata(department)]
      });
    } catch (err) {
      console.error("ChromaDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("ChromaDepartmentRepository.createDepartment(): ID [%d]", department.id);
  }
  /**
   * Gets the departments, each populated with its employees.
   * 
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const client = await clientPromise;
    try {
      const departmentsCollection = await client.getOrCreateCollection({
        name: constants.DEPARTMENTS_COLLECTION,
        embeddingFunction: null
      });
      const employeesCollection = await client.getOrCreateCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      const departmentRows = await departmentsCollection.get();
      const departmentMap = new Map<number, Department>();
      departmentRows.ids.forEach((id: string, index: number) => {
        const metadata: any = departmentRows.metadatas?.[index] ?? {};
        //const department = helpers.toDepartment(id, meta); FIXME FIXME FIXME FIXME FIXME FIXME 
        departmentMap.set(Number(id), {
          id: Number(id),
          name: metadata.name,
          startDate: metadata.startDate ? new Date(metadata.startDate) : undefined,
          endDate: metadata.endDate ? new Date(metadata.endDate) : undefined,
          notes: metadata.notes,
          keywords: metadata.keywords ? String(metadata.keywords).split(',') : [],
          image: metadata.image,
          employees: []
        });
      });

      const employeeRows = await employeesCollection.get();
      employeeRows.ids.forEach((id: string, index: number) => {
        const metadata = employeeRows.metadatas?.[index] ?? {};
        const department = departmentMap.get(Number(metadata.departmentId));
        if (department) {
          // department.employees.push(helpers.toEmployee(id, employeeRows.metadatas[index])); FIXME FIXME FIXME FIXME FIXME FIXME 
          department.employees.push({
            id: Number(id),
            departmentId: Number(metadata.departmentId),
            firstName: metadata.firstName,
            lastName: metadata.lastName,
            title: metadata.title,
            phone: metadata.phone,
            mail: metadata.mail,
            streetName: metadata.streetName,
            houseNumber: metadata.houseNumber,
            postalCode: metadata.postalCode,
            locality: metadata.locality,
            province: metadata.province,
            country: metadata.country
          } as Employee);
        }
      });
      console.log("ChromaDepartmentRepository.getDepartments():");
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("ChromaDepartmentRepository.getDepartments():", err);
      throw err;
    }
  }
  /**
   * Gets the department by id, populated with its employees.
   *
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const client = await clientPromise;
    try {
      const departmentsCollection = await client.getOrCreateCollection({
        name: constants.DEPARTMENTS_COLLECTION,
        embeddingFunction: null
      });
      const departmentRow = await departmentsCollection.get({ ids: [String(id)] });
      if (departmentRow.ids.length === 0) {
        console.log("ChromaDepartmentRepository.getDepartment(): no department found with id[%d]", id);
        return undefined;
      }
      const department = helpers.toDepartment(departmentRow.ids[0], departmentRow.metadatas[0]);
      const employeesCollection = await client.getOrCreateCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      const employeeRows = await employeesCollection.get({
        where: { [constants.DEPARTMENT_ID_FIELD]: id }
      });
      department.employees = employeeRows.ids
        .map((id, index) => helpers.toEmployee(id, employeeRows.metadatas[index]))
        .sort((emp1, emp2) => emp1.id - emp2.id);
      console.log("ChromaDepartmentRepository.getDepartment(): id[%d]", id);
      return department;
    } catch (err) {
      console.error("ChromaDepartmentRepository.getDepartment():", err);
      throw err;
    }
  }
  /**
   * Updates an existing department.
   *
   * Departments and employees are kept in two separate Chroma collections (see the class-level
   * doc), so - like the MongoDB implementation - only the department's own fields are written
   * here; the employees collection is left untouched. Reassign an employee to a different
   * department via {@link ChromaEmployeeRepository#updateEmployee} or {@link transferEmployees}.
   *
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(department: Department): Promise<void> {
    const client = await clientPromise;
    try {
      const collection = await client.getOrCreateCollection({
        name: constants.DEPARTMENTS_COLLECTION,
        embeddingFunction: null
      });
      const existing = await collection.get({ ids: [String(department.id)] });
      if (existing.ids.length === 0) {
        console.log("ChromaDepartmentRepository.updateDepartment(): no department updated with id[%d]",
          department.id);
        return;
      }
      await collection.update({
        ids: [String(department.id)],
        embeddings: [helpers.toPlaceholderEmbedding(department.name)],
        documents: [department.name],
        metadatas: [helpers.toDepartmentMetadata(department)]
      });
    } catch (err) {
      console.error("ChromaDepartmentRepository.updateDepartment():", err);
      throw err;
    }
    console.log("ChromaDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }
  /**
   * Deletes a department by its id, together with every employee that belongs to it.
   *
   * Departments and employees live in two separate Chroma collections with no built-in
   * foreign-key/cascade support.
   * The employees are removed first with a single `where`-filtered `delete()` call, then the
   * department record itself.
   *
   * @param departmentId the id of the department to be deleted
   * @returns void
   */
  async deleteDepartment(departmentId: number): Promise<void> {
    const client = await clientPromise;
    try {
      const employeesCollection = await client.getOrCreateCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      const deletedEmployees = await employeesCollection.delete({
        where: { [constants.DEPARTMENT_ID_FIELD]: departmentId }
      });
      const departmentsCollection = await client.getOrCreateCollection({
        name: constants.DEPARTMENTS_COLLECTION,
        embeddingFunction: null
      });
      await departmentsCollection.delete({ ids: [String(departmentId)] });
      console.log("ChromaDepartmentRepository.deleteDepartment(): department id[%d], deleted employees count[%d]",
        departmentId, deletedEmployees.deleted ?? 0);
    } catch (err) {
      console.error("ChromaDepartmentRepository.deleteDepartment():", err);
      throw err;
    }
  }
  /**
   * Transfers the given employees from the source department to the target department.
   *
   * The function is executed as a single batched request rather than one call per employee.
   * 1. it resolves the employees that both belong to the source department *and* appear in
   *  `employeeIds` via a single `get()` call that combines an `ids` filter with a `where` filter.
   * 2. it reassigns those employees to the target department with a single batched `update()`
   *  call to the "employees" collection, changing only the `departmentId` metadata field.
   *
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the ids of the employees to transfer
   * @returns void
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    if (employeeIds.length === 0) {
      console.log("ChromaDepartmentRepository.transferEmployees(): " +
        "source department id[%d], target department id[%d], no employee ids supplied", sourceDepartmentId, targetDepartmentId);
      return;
    }
    const client = await clientPromise;
    try {
      const employeesCollection = await client.getOrCreateCollection({
        name: constants.EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      const employeeRows = await employeesCollection.get({
        ids: employeeIds.map(String),
        where: { [constants.DEPARTMENT_ID_FIELD]: sourceDepartmentId }
      });
      if (employeeRows.ids.length === 0) {
        console.log("ChromaDepartmentRepository.transferEmployees(): " +
          "source department id[%d], target department id[%d], no employees transferred", sourceDepartmentId, targetDepartmentId);
        return;
      }
      const metadatas: Metadata[] = employeeRows.metadatas.map(metadata => ({
        ...(metadata ?? {}),
        [constants.DEPARTMENT_ID_FIELD]: targetDepartmentId
      }));
      await employeesCollection.update({
        ids: employeeRows.ids,
        metadatas: metadatas
      });
      console.log("ChromaDepartmentRepository.transferEmployees(): " +
        "source department id[%d], target department id[%d], transferred employees count[%d]",
        sourceDepartmentId, targetDepartmentId, employeeRows.ids.length);
    } catch (err) {
      console.error("ChromaDepartmentRepository.transferEmployees():", err);
      throw err;
    }
  }
}
