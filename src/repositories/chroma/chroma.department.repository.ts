import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { clientPromise } from "./chroma.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import {
  DEPARTMENTS_COLLECTION, EMPLOYEES_COLLECTION,
  toDepartmentMetadata, toEmployeeMetadata, toPlaceholderEmbedding
} from "./chroma.constants.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 *
 * Departments and employees are kept in two separate Chroma collections.
 * Since this application never performs a similarity search over these records,
 * both collections are created with `embeddingFunction: null` and
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
        name: DEPARTMENTS_COLLECTION,
        embeddingFunction: null
      });
      await collection.upsert({
        ids: [String(department.id)],
        embeddings: [toPlaceholderEmbedding(department.name)],
        documents: [department.name],
        metadatas: [toDepartmentMetadata(department)]
      });
    } catch (err) {
      console.error("ChromaDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("ChromaDepartmentRepository.createDepartment(): ID [%d]", department.id);
  }
  /**
   * Gets the departments, each populated with its employees.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const client = await clientPromise;
    try {
      const departmentsCollection = await client.getOrCreateCollection({
        name: DEPARTMENTS_COLLECTION,
        embeddingFunction: null
      });
      const employeesCollection = await client.getOrCreateCollection({
        name: EMPLOYEES_COLLECTION,
        embeddingFunction: null
      });
      const departmentRows: any = await departmentsCollection.get();
      const employeeRows: any = await employeesCollection.get();

      const departmentMap = new Map<number, Department>();
      departmentRows.ids.forEach((id: string, index: number) => {
        const meta: any = departmentRows.metadatas?.[index] ?? {};
        departmentMap.set(Number(id), {
          id: Number(id),
          name: meta.name,
          startDate: meta.startDate ? new Date(meta.startDate) : undefined,
          endDate: meta.endDate ? new Date(meta.endDate) : undefined,
          notes: meta.notes,
          keywords: meta.keywords ? String(meta.keywords).split(',') : [],
          image: meta.image,
          employees: []
        });
      });

      employeeRows.ids.forEach((id: string, index: number) => {
        const meta: any = employeeRows.metadatas?.[index] ?? {};
        const dept = departmentMap.get(Number(meta.departmentId));
        if (dept) {
          dept.employees.push({
            id: Number(id),
            departmentId: Number(meta.departmentId),
            firstName: meta.firstName,
            lastName: meta.lastName,
            title: meta.title,
            phone: meta.phone,
            mail: meta.mail,
            streetName: meta.streetName,
            houseNumber: meta.houseNumber,
            postalCode: meta.postalCode,
            locality: meta.locality,
            province: meta.province,
            country: meta.country
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
  async getDepartment(id: number): Promise<Department | undefined> {
    return undefined;
  }
  async updateDepartment(department: Department): Promise<void> {
  }
  async deleteDepartment(departmentId: number): Promise<void> {
  }
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
  }
}
