import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { clientPromise } from "./cassandra.pool.js";
import {
  CREATE_DEPARTMENT_CQL, SELECT_DEPARTMENTS_CQL, SELECT_EMPLOYEES_CQL
} from "./cassandra.constants.js";

/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class CassandraDepartmentRepository {
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
      await client.execute(CREATE_DEPARTMENT_CQL, values, { prepare: true });
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
      const deptResultSet = await client.execute(SELECT_DEPARTMENTS_CQL, [], { prepare: true });
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
      const empResultSet = await client.execute(SELECT_EMPLOYEES_CQL, [], { prepare: true });
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
}