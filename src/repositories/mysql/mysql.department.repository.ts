import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { poolPromise } from "./mysql.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import * as mappers from "../mappers.js";
import * as constants from "./mysql.constants.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export class MySqlDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  async createDepartment(department: Department): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query<ResultSetHeader>(constants.INSERT_DEPARTMENT_SQL, [
        department.id,
        department.name,
        department.startDate,
        department.endDate,
        department.notes,
        department.keywords ? department.keywords.join(',') : null,
        department.image
      ]);
      if (!result.affectedRows) {
        await connection.rollback();
        console.log("MySqlDepartmentRepository.createDepartment(): " +
          "department not created, department id[%d]", department.id);
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
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const pool = await poolPromise;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(constants.SELECT_DEPARTMENTS_SQL);
      const departmentMap = new Map<number, Department>();
      for (const row of rows) {
        let department = departmentMap.get(row.id);
        if (!department) {
          department = mappers.mapDatabaseRowToDepartment(row);
          departmentMap.set(row.id, department);
        }
        if (row.employee_id) {
          department.employees.push(mappers.mapDatabaseRowToEmployee(row, false));
        }
      }
      const departments = Array.from(departmentMap.values());
      console.log("MySqlDepartmentRepository.getDepartments(): departments count[%d]", departments.length);
      return departments;
    } catch (err) {
      console.error("MySqlDepartmentRepository.getDepartments():", err);
      throw err;
    }
  }
  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const pool = await poolPromise;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(constants.SELECT_DEPARTMENT_SQL, [id]);
      if (!rows.length) {
        console.log("MySqlDepartmentRepository.getDepartment(): department not found, department id[%d]", id);
        return undefined;
      }
      const department = mappers.mapDatabaseRowToDepartment(rows[0]);
      for (const row of rows) {
        if (row.employee_id) {
          department.employees.push(mappers.mapDatabaseRowToEmployee(row, false));
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
   * 
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateDepartment(department: Department): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query<ResultSetHeader>(constants.UPDATE_DEPARTMENT_SQL, [
        department.name,
        department.startDate,
        department.endDate,
        department.notes,
        department.keywords ? department.keywords.join(',') : null,
        department.image,
        department.id
      ]);
      if (!result.affectedRows) {
        await connection.rollback();
        console.log("MySqlDepartmentRepository.updateDepartment(): " +
          "department not updated, department id[%d]", department.id);
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
      await this.updateEmployeeInDepartment(employee);
    }
    console.log("MySqlDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }
  /**
   * Updates an employee in the department.
   * 
   * @param employee the employee
   * @returns void
   */
  private async updateEmployeeInDepartment(employee: Employee): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query<ResultSetHeader>(constants.UPDATE_EMPLOYEE_DEPARTMENT_SQL, [
        employee.departmentId,
        employee.id
      ]);
      if (!result.affectedRows) {
        await connection.rollback();
        console.log("MySqlDepartmentRepository.updateEmployeeInDepartment(): " +
          "employee not updated, employee id[%d], departmentId[%d]", employee.id, employee.departmentId);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("MySqlDepartmentRepository.updateEmployeeInDepartment():", err);
      throw err;
    } finally {
      connection.release();
    }
  }
  /**
   * Deletes a department by its ID.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(constants.CALL_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL, [id]);
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
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    if (employeeIds.length === 0) {
      console.warn("MySqlDepartmentRepository.transferEmployees(): no employee ids provided, nothing to transfer");
      return;
    }
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(constants.CALL_TRANSFER_EMPLOYEES_SQL,
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
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}
