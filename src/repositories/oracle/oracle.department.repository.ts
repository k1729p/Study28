import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { poolPromise } from "./oracle.pool.js";
import { CREATE_DEPARTMENT_SQL, SELECT_DEPARTMENTS_SQL } from "./oracle.constants.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class OracleDepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(department: Department): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const startDate = department.startDate ? new Date(department.startDate) : null;
      const endDate = department.endDate ? new Date(department.endDate) : null;
      const bindParams = {
        id: department.id,
        name: department.name,
        startDate,
        endDate,
        notes: department.notes || null,
        keywords: department.keywords?.join(',') || null,
        image: department.image || null
      };
      await connection.execute(CREATE_DEPARTMENT_SQL, bindParams, { autoCommit: true });
    } catch (err) {
      console.error("OracleDepartmentRepository.createDepartment():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleDepartmentRepository.createDepartment(): error closing connection", err);
      }
    }
    console.log("OracleDepartmentRepository.createDepartment(): department id[%s]", department.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(SELECT_DEPARTMENTS_SQL);
      const departmentMap = new Map<number, Department>();
      const rows = result.rows as any[] || [];

      for (const row of rows) {
        const departmentId = row.department_id;
        let department = departmentMap.get(departmentId);
        if (!department) {
          department = {
            id: row.department_id,
            name: row.department_name,
            startDate: row.start_date,
            endDate: row.end_date,
            notes: row.notes,
            keywords: row.keywords ? row.keywords.split(',') : [],
            image: row.image,
            employees: []
          };
          departmentMap.set(departmentId, department);
        }
        if (row.employee_id) {
          const employee: Employee = {
            id: row.employee_id,
            departmentId: row.employee_department_id,
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
          };
          department.employees.push(employee);
        }
      }
      console.log("OracleDepartmentRepository.getDepartments():");
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("OracleDepartmentRepository.getDepartments():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleDepartmentRepository.getDepartments(): error closing connection", err);
      }
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