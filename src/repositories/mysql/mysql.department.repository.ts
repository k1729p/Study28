import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { poolPromise } from "./mysql.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import {
  CREATE_DEPARTMENT_SQL, SELECT_DEPARTMENTS_SQL, SELECT_DEPARTMENT_SQL,
  UPDATE_DEPARTMENT_SQL, UPDATE_EMPLOYEE_DEPARTMENT_SQL,
  CALL_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL, CALL_TRANSFER_EMPLOYEES_SQL
} from "./mysql.constants.js";
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
  async createDepartment(department: Department): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const startDate = department.startDate ? new Date(department.startDate).toISOString().split('T')[0] : null;
      const endDate = department.endDate ? new Date(department.endDate).toISOString().split('T')[0] : null;
      const [result] = await connection.query<ResultSetHeader>(CREATE_DEPARTMENT_SQL, [
        department.id,
        department.name,
        startDate,
        endDate,
        department.notes,
        department.keywords ? department.keywords.join(',') : null,
        department.image
      ]);
      if (!result.affectedRows) {
        await connection.rollback();
        console.log("MySqlDepartmentRepository.createDepartment(): no department created with id[%d]",
          department.id);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlDepartmentRepository.createDepartment():", err);
      throw err;
    } finally {
      connection.release();
    }
    console.log("MySqlDepartmentRepository.createDepartment(): department id[%d]", department.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const pool = await poolPromise;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(SELECT_DEPARTMENTS_SQL);
      const departmentMap = new Map<number, Department>();
      for (const row of rows) {
        const departmentId = row.department_id;
        let department = departmentMap.get(departmentId);

        if (!department) {
          department = {
            id: row.department_id,
            name: row.department_name,
            startDate: row.start_date ? new Date(row.start_date) : undefined,
            endDate: row.end_date ? new Date(row.end_date) : undefined,
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
      console.log("MySqlDepartmentRepository.getDepartments():");
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("MySqlDepartmentRepository.getDepartments():", err);
      throw err;
    }
  }
  /**
   * Gets the department by id.
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const pool = await poolPromise;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(SELECT_DEPARTMENT_SQL, [id]);
      if (!rows.length) {
        console.log("MySqlDepartmentRepository.getDepartment(): no department found with id[%d]", id);
        return undefined;
      }
      const firstRow = rows[0];
      const department: Department = {
        id: firstRow.department_id,
        name: firstRow.department_name,
        startDate: firstRow.start_date ? new Date(firstRow.start_date) : undefined,
        endDate: firstRow.end_date ? new Date(firstRow.end_date) : undefined,
        notes: firstRow.notes,
        keywords: firstRow.keywords ? firstRow.keywords.split(',') : [],
        image: firstRow.image,
        employees: []
      };
      for (const row of rows) {
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
      console.log("MySqlDepartmentRepository.getDepartment(): id[%d]", id);
      return department;
    } catch (err) {
      console.error("MySqlDepartmentRepository.getDepartment():", err);
      throw err;
    }
  }
  /**
   * Updates an existing department.
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(department: Department): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const startDate = department.startDate ? new Date(department.startDate).toISOString().split('T')[0] : null;
      const endDate = department.endDate ? new Date(department.endDate).toISOString().split('T')[0] : null;
      const [result] = await connection.query<ResultSetHeader>(UPDATE_DEPARTMENT_SQL, [
        department.name,
        startDate,
        endDate,
        department.notes,
        department.keywords ? department.keywords.join(',') : null,
        department.image,
        department.id
      ]);
      if (!result.affectedRows) {
        await connection.rollback();
        console.log("MySqlDepartmentRepository.updateDepartment(): no department updated with id[%d]",
          department.id);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlDepartmentRepository.updateDepartment():", err);
      throw err;
    } finally {
      connection.release();
    }
    for (const employee of department.employees) {
      await this.updateEmployeeDepartment(employee);
    }
    console.log("MySqlDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }
  /**
   * Updates the department in the employee.
   * @param employee the employee
   * @returns void
   */
  private async updateEmployeeDepartment(employee: Employee): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query<ResultSetHeader>(UPDATE_EMPLOYEE_DEPARTMENT_SQL, [
        employee.departmentId,
        employee.id
      ]);
      if (!result.affectedRows) {
        await connection.rollback();
        console.log("MySqlDepartmentRepository.updateEmployeeDepartment(): no employee updated, employee id[%d]",
          employee.id);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlDepartmentRepository.updateEmployeeDepartment():", err);
      throw err;
    } finally {
      connection.release();
    }
  }
  /**
   * Deletes a department by its id.
   * @param id the id of the department to be deleted
   * @returns void
   */
  async deleteDepartment(id: number): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(CALL_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL, [id]);
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlDepartmentRepository.deleteDepartment():", err);
      throw err;
    } finally {
      connection.release();
    }
    console.log("MySqlDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers the employees from source department to target department.
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the transferred employees array
   * @returns void
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(CALL_TRANSFER_EMPLOYEES_SQL,
        [sourceDepartmentId, targetDepartmentId, employeeIds.join(',')]
      );
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlDepartmentRepository.transferEmployees():", err);
      throw err;
    } finally {
      connection.release();
    }
    console.log("MySqlDepartmentRepository.transferEmployees(): " +
      "transferred employees count[%d], source department id[%d], target department id[%d]",
      employeeIds.length, sourceDepartmentId, targetDepartmentId);
  }
}
