import sql from 'mssql';

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { poolPromise } from "./sql-server.pool.js";

const CREATE_DEPARTMENT_SQL = `
  INSERT INTO departments (id, name, start_date, end_date, notes, keywords, image)
  OUTPUT INSERTED.*
  VALUES (@id, @name, @startDate, @endDate, @notes, @keywords, @image)
`;
const SELECT_DEPARTMENTS_SQL = `
  SELECT 
    d.id AS department_id, 
    d.name AS department_name, 
    d.start_date, 
    d.end_date, 
    d.notes, 
    d.keywords, 
    d.image,
    e.id AS employee_id,
    e.department_id AS employee_department_id,
    e.first_name,
    e.last_name,
    e.title,
    e.phone,
    e.mail,
    e.street_name,
    e.house_number,
    e.postal_code,
    e.locality,
    e.province,
    e.country
  FROM departments d
  LEFT JOIN employees e ON d.id = e.department_id
`;

/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class SQLServerDepartmentRepository {
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
}