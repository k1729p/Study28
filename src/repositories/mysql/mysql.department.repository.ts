import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { poolPromise } from "./mysql.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import { CREATE_DEPARTMENT_SQL, SELECT_DEPARTMENTS_SQL } from "./mysql.constants.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class MySqlDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(dept: Department): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const startDate = dept.startDate ? new Date(dept.startDate).toISOString().split('T')[0] : null;
      const endDate = dept.endDate ? new Date(dept.endDate).toISOString().split('T')[0] : null;
      const values = [
        dept.id, dept.name, startDate, endDate,
        dept.notes, dept.keywords ? dept.keywords.join(',') : null, dept.image
      ];
      await connection.query(CREATE_DEPARTMENT_SQL, values);
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("MySqlDepartmentRepository.createDepartment(): ID [%d]", dept.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const pool = await poolPromise;
    try {
      const [rows]: any = await pool.query(SELECT_DEPARTMENTS_SQL);
      const departmentMap = new Map<number, Department>();
      for (const row of rows) {
        let dept = departmentMap.get(row.department_id);
        if (!dept) {
          dept = {
            id: row.department_id,
            name: row.department_name,
            startDate: row.start_date ? new Date(row.start_date) : undefined,
            endDate: row.end_date ? new Date(row.end_date) : undefined,
            notes: row.notes,
            keywords: row.keywords ? row.keywords.split(',') : [],
            image: row.image,
            employees: []
          };
          departmentMap.set(row.department_id, dept);
        }
        if (row.employee_id) {
          dept.employees.push({
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
          });
        }
      }
      console.log("MySqlDepartmentRepository.getDepartments():");
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("MySqlDepartmentRepository.getDepartments():", err);
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