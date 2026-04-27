import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { clientPromise } from "./elasticsearch.pool.js";
import { INDEX_DEPARTMENTS, INDEX_EMPLOYEES} from "./elasticsearch.constants.js";

/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class ElasticsearchDepartmentRepository {
  /**
   * Creates a new department.
   * @param dept the department to be created
   * @return void
   */
  async createDepartment(dept: Department): Promise<void> {
    const client = await clientPromise;
    try {
      await client.index({
        index: INDEX_DEPARTMENTS,
        id: dept.id.toString(),
        document: {
          id: dept.id,
          name: dept.name,
          startDate: dept.startDate,
          endDate: dept.endDate,
          notes: dept.notes,
          keywords: dept.keywords || [],
          image: dept.image
        },
        refresh: true // Ensures the data is immediately available for searching
      });
    } catch (err) {
      console.error("ElasticsearchDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("ElasticsearchDepartmentRepository.createDepartment(): id[%d]", dept.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const client = await clientPromise;
    try {
      const departmentResponse = await client.search({
        index: INDEX_DEPARTMENTS,
        size: 1000
      });
      const employeeResponse = await client.search({
        index: INDEX_EMPLOYEES,
        size: 1000
      });
      const departmentMap = new Map<number, Department>();
      const departmentHits = departmentResponse.hits.hits as any[];
      for (const hit of departmentHits) {
        const source = hit._source;
        departmentMap.set(source.id, {
          id: source.id,
          name: source.name,
          startDate: source.startDate ? new Date(source.startDate) : undefined,
          endDate: source.endDate ? new Date(source.endDate) : undefined,
          notes: source.notes,
          keywords: source.keywords || [],
          image: source.image,
          employees: []
        });
      }
      const employeeHits = employeeResponse.hits.hits as any[];
      for (const hit of employeeHits) {
        const source = hit._source;
        const department = departmentMap.get(source.departmentId);
        if (department) {
          department.employees.push({
            id: source.id,
            departmentId: source.departmentId,
            firstName: source.firstName,
            lastName: source.lastName,
            title: source.title,
            phone: source.phone,
            mail: source.mail,
            streetName: source.streetName,
            houseNumber: source.houseNumber,
            postalCode: source.postalCode,
            locality: source.locality,
            province: source.province,
            country: source.country
          } as Employee);
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
}
