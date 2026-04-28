import sql from 'mssql';

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { poolPromise } from "./sql-server.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import {
  CREATE_DEPARTMENT_SQL,
  SELECT_DEPARTMENTS_SQL
} from "./sql-server.constants.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class SQLServerDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(department: Department): Promise<void> {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, department.id)
        .input('name', sql.NVarChar, department.name)
        .input('startDate', sql.Date, department.startDate)
        .input('endDate', sql.Date, department.endDate)
        .input('notes', sql.NVarChar, department.notes)
        .input('keywords', sql.NVarChar, department.keywords?.join(','))
        .input('image', sql.NVarChar, department.image)
        .query(CREATE_DEPARTMENT_SQL);
    } catch (err) {
      console.error("SQLServerDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("SQLServerDepartmentRepository.createDepartment(): department id[%s]", department.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(SELECT_DEPARTMENTS_SQL);
      const departmentMap = new Map<number, Department>();

      for (const row of result.recordset) {
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
      console.log("SQLServerDepartmentRepository.getDepartments():");
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("SQLServerDepartmentRepository.getDepartments():", err);
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