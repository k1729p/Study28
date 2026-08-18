import sql from 'mssql';

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { poolPromise } from "./sql-server.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import * as mappers from "../mappers.js";
import * as constants from "./sql-server.constants.js";
/**
 * This repository class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class SqlServerDepartmentRepository implements DepartmentRepository {
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
        .query(constants.INSERT_DEPARTMENT_SQL);
    } catch (err) {
      console.error("SqlServerDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("SqlServerDepartmentRepository.createDepartment(): department id[%s]", department.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(constants.SELECT_DEPARTMENTS_SQL);
      const departmentMap = new Map<number, Department>();
      for (const row of result.recordset) {
        let department = departmentMap.get(row.id);
        if (!department) {
          department = mappers.mapDatabaseRowToDepartment(row);
          departmentMap.set(row.id, department);
        }
        if (row.employee_id) {
          department.employees.push(mappers.mapDatabaseRowToEmployee(row, false));
        }
      }
      console.log("SqlServerDepartmentRepository.getDepartments():");
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("SqlServerDepartmentRepository.getDepartments():", err);
      throw err;
    }
  }
  /**
   * Gets the department by id.
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(constants.SELECT_DEPARTMENT_SQL);
      if (!result.recordset.length) {
        console.log("SqlServerDepartmentRepository.getDepartment(): no department found with id[%d]", id);
        return undefined;
      }
      const rows = result.recordset;
      const department = mappers.mapDatabaseRowToDepartment(rows[0]);
      for (const row of rows) {
        if (row.employee_id) {
          department.employees.push(mappers.mapDatabaseRowToEmployee(row, false));
        }
      }
      console.log("SqlServerDepartmentRepository.getDepartment(): id[%d]", id);
      return department;
    } catch (err) {
      console.error("SqlServerDepartmentRepository.getDepartment():", err);
      throw err;
    }
  }
  /**
   * Updates an existing department.
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(department: Department): Promise<void> {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, department.id)
        .input('name', sql.NVarChar, department.name)
        .input('startDate', sql.Date, department.startDate)
        .input('endDate', sql.Date, department.endDate)
        .input('notes', sql.NVarChar, department.notes)
        .input('keywords', sql.NVarChar, department.keywords?.join(','))
        .input('image', sql.NVarChar, department.image)
        .query(constants.UPDATE_DEPARTMENT_SQL);
      if (!result.rowsAffected[0]) {
        console.log("SqlServerDepartmentRepository.updateDepartment(): no department updated with id[%d]",
          department.id);
        return;
      }
    } catch (err) {
      console.error("SqlServerDepartmentRepository.updateDepartment():", err);
      throw err;
    }
    department.employees.forEach(employee => this.updateEmployeeDepartment(employee));
    console.log("SqlServerDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }
  /**
   * Updates the department in the employee.
   * @param employee the employee
   * @returns void
   */
  private async updateEmployeeDepartment(employee: Employee) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('departmentId', sql.Int, employee.departmentId)
        .input('id', sql.Int, employee.id)
        .query(constants.UPDATE_EMPLOYEE_DEPARTMENT_SQL);
      if (!result.rowsAffected[0]) {
        console.log("SqlServerDepartmentRepository.updateEmployeeDepartment(): no employee updated, employee id[%d]",
          employee.id);
        return;
      }
    } catch (err) {
      console.error("SqlServerDepartmentRepository.updateEmployeeDepartment():", err);
      throw err;
    }
  }
  /**
   * Deletes a department by its id.
   * @param id the id of the department to be deleted
   * @returns void
   */
  async deleteDepartment(id: number): Promise<void> {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('department_id', sql.Int, id)
        .execute(constants.EXECUTE_DELETE_DEPARTMENT_AND_EMPLOYEES_PROCEDURE);
    } catch (err) {
      console.error("SqlServerDepartmentRepository.deleteDepartment():", err);
      throw err;
    }
    console.log("SqlServerDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers the given employees from source department to target department.
   *
   * Delegates to the dbo.transfer_employees stored procedure.
   * The employee ids are sent as a Table-Valued Parameter (dbo.id_list_type) rather
   * than a delimited string or repeated round trips,
   * so the whole set of moves is validated, type-checked, and applied
   * by SQL Server in a single set-based, transactional statement.
   * In stored procedure the whole operation runs inside an explicit transaction
   * with TRY/CATCH error handling so that either all rows are moved, or none are (atomicity),
   * and any failure is reported back to the caller after the transaction has been safely rolled back.
   *
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the transferred employees array
   * @returns void
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    const idListTable = new sql.Table('dbo.id_list_type');
    idListTable.columns.add('id', sql.Int, { nullable: false });
    employeeIds.forEach(employeeId => idListTable.rows.add(employeeId));
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('source_department_id', sql.Int, sourceDepartmentId)
        .input('target_department_id', sql.Int, targetDepartmentId)
        .input('employee_ids', idListTable)
        .execute(constants.EXECUTE_TRANSFER_EMPLOYEES_PROCEDURE);
    } catch (err) {
      console.error("SqlServerDepartmentRepository.transferEmployees():", err);
      throw err;
    }
    console.log("SqlServerDepartmentRepository.transferEmployees(): " +
      "transferred employees count[%d], source department id[%d], target department id[%d]",
      employeeIds.length, sourceDepartmentId, targetDepartmentId);
  }
}
