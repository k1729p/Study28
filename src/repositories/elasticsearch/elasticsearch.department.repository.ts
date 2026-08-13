import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { clientPromise } from "./elasticsearch.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import * as mappers from "../mappers.js";
import * as constants from "./elasticsearch.constants.js";

/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class ElasticsearchDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(department: Department): Promise<void> {
    const client = await clientPromise;
    try {
      await client.index({
        index: constants.INDEX_DEPARTMENTS,
        id: department.id.toString(),
        document: {
          id: department.id,
          name: department.name,
          startDate: department.startDate,
          endDate: department.endDate,
          notes: department.notes,
          keywords: department.keywords || [],
          image: department.image
        },
        refresh: true // Ensures the data is immediately available for searching
      });
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("ElasticsearchDepartmentRepository.createDepartment(): id[%d]", department.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const client = await clientPromise;
    try {
      const departmentResponse = await client.search({
        index: constants.INDEX_DEPARTMENTS,
        size: 1000
      });
      const employeeResponse = await client.search({
        index: constants.INDEX_EMPLOYEES,
        size: 1000
      });
      const departmentMap = new Map<number, Department>();
      const departmentHits = departmentResponse.hits.hits as any[];
      for (const hit of departmentHits) {
        departmentMap.set(hit._source.id, mappers.mapDatabaseRowToDepartment(hit._source));
      }
      const employeeHits = employeeResponse.hits.hits as any[];
      for (const hit of employeeHits) {
        const source = hit._source;
        const department = departmentMap.get(source.departmentId);
        if (department) {
          department.employees.push(mappers.mapDatabaseRowToEmployee(hit._source, true));
        }
      }
      console.log("ElasticsearchDepartmentRepository.getDepartments():");
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.getDepartments():", err);
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
