import { Department } from "../../models/department.js";
import { clientPromise } from "./cassandra.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import * as constants from "./cassandra.constants.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class CassandraDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(department: Department): Promise<void> {
    try {
      const client = await clientPromise;
      const startDate = department.startDate ? new Date(department.startDate).toISOString().split('T')[0] : null;
      const endDate = department.endDate ? new Date(department.endDate).toISOString().split('T')[0] : null;
      const values = [
        department.id, department.name,
        startDate, endDate,
        department.notes, department.keywords || null, department.image
      ];
      await client.execute(constants.CREATE_DEPARTMENT_CQL, values, { prepare: true });
    } catch (err) {
      console.error("CassandraDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("CassandraDepartmentRepository.createDepartment(): id[%d]", department.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    try {
      const client = await clientPromise;
      const deptResultSet = await client.execute(constants.SELECT_DEPARTMENTS_CQL, [], { prepare: true });
      const departmentMap = new Map<number, Department>();
      for (const row of deptResultSet.rows) {
        const department: Department = {
          id: row.id,
          name: row.name,
          // Cassandra driver returns dates as standard Date objects or local dates
          startDate: row.start_date ? new Date(row.start_date) : undefined,
          endDate: row.end_date ? new Date(row.end_date) : undefined,
          notes: row.notes,
          keywords: row.keywords || [],
          image: row.image,
          employees: []
        };
        departmentMap.set(row.id, department);
      }
      const empResultSet = await client.execute(constants.SELECT_EMPLOYEES_CQL, [], { prepare: true });
      for (const row of empResultSet.rows) {
        const department = departmentMap.get(row.department_id);
        if (department) {
          department.employees.push({
            id: row.id,
            departmentId: row.department_id,
            firstName: row.first_name,
            lastName: row.last_name,
            title: row.title,
            phone: row.phone,
            mail: row.mail,
            streetName: row.street_name,
            houseNumber: row.house_number,
            postalCode: row.postal_code,
            locality: row.locality,
            province: row.province,
            country: row.country
          });
        }
      }
      console.log("CassandraDepartmentRepository.getDepartments(): departments count[%d]", departmentMap.size);
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("CassandraDepartmentRepository.getDepartments():", err);
      throw err;
    }
  }
  /**
   * Gets the department by id.
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    console.log("CassandraDepartmentRepository.getDepartment(): id[%d]", id);
    return undefined;
  }
  /**
   * Updates an existing department.
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(department: Department): Promise<void> {
    console.log("CassandraDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }
  /**
   * Deletes a department by its id.
   * @param id the id of the department to be deleted
   * @returns void
   */
  async deleteDepartment(id: number): Promise<void> {
    console.log("CassandraDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers the employees from source department to target department.
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the transferred employees array
   * @returns void
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    console.log("CassandraDepartmentRepository.transferEmployees(): " +
      "transferred employees count[%d], source department id[%d], target department id[%d]",
      employeeIds.length, sourceDepartmentId, targetDepartmentId);
  }
}