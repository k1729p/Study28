import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { poolPromise } from "./postgresql.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import * as helpers from "../../utils/helpers.js";
import * as constants from "./postgresql.constants.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class PostgreSQLDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(department: Department) {

    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(constants.INSERT_DEPARTMENT_SQL, [
        department.id,
        department.name,
        department.startDate,
        department.endDate,
        department.notes,
        department.keywords,
        department.image
      ]);
      if (!result.rowCount) {
        await client.query('ROLLBACK');
        console.log("PostgreSQLDepartmentRepository.createDepartment(): no department created with id[%d]",
          department.id);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSQLDepartmentRepository.createDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSQLDepartmentRepository.createDepartment(): department id[%s]", department.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      const result = await client.query(constants.SELECT_DEPARTMENTS_SQL);
      const departmentMap = new Map<number, Department>();
      for (const row of result.rows) {
        const departmentId = row.department_id;
        let department = departmentMap.get(departmentId);
        if (!department) {
          department = helpers.mapDatabaseRowToDepartment(row);
          departmentMap.set(departmentId, department);
        }
        if (row.employee_id) {
          department.employees.push(helpers.mapDatabaseRowToEmployee(row, false));
        }
      }
      console.log("PostgreSQLDepartmentRepository.getDepartments():");
      return Array.from(departmentMap.values());
    } catch (err) {
      console.error("PostgreSQLDepartmentRepository.getDepartments():", err);
      throw err;
    } finally {
      client.release();
    }
  }
  /**
   * Gets the department by id.
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      const result = await client.query(constants.SELECT_DEPARTMENT_SQL, [id]);
      if (!result.rowCount) {
        console.log("PostgreSQLDepartmentRepository.getDepartment(): no department found with id[%d]", id);
        return undefined;
      }
      const rows = result.rows;
      const department = helpers.mapDatabaseRowToDepartment(rows[0]);
      for (const row of rows) {
        if (row.employee_id) {
          department.employees.push(helpers.mapDatabaseRowToEmployee(row, false));
        }
      }
      console.log("PostgreSQLDepartmentRepository.getDepartment(): id[%d]", id);
      return department;
    } catch (err) {
      console.error("PostgreSQLDepartmentRepository.getDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Updates an existing department.
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(department: Department) {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let result = await client.query(constants.UPDATE_DEPARTMENT_SQL, [
        department.name,
        department.startDate,
        department.endDate,
        department.notes,
        department.keywords,
        department.image,
        department.id
      ]);
      if (!result.rowCount) {
        await client.query('ROLLBACK');
        console.log("PostgreSQLDepartmentRepository.updateDepartment(): no department updated with id[%d]",
          department.id);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSQLDepartmentRepository.updateDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
    department.employees.forEach(employee => this.updateEmployeeDepartment(employee));
    console.log("PostgreSQLDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }
  /**
   * Updates the department in the employee.
   * @param employee the employee
   * @returns void
   */
  private async updateEmployeeDepartment(employee: Employee) {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(constants.UPDATE_EMPLOYEE_DEPARTMENT_SQL, [
        employee.departmentId,
        employee.id
      ]);
      if (!result.rowCount) {
        await client.query('ROLLBACK');
        console.log("PostgreSQLDepartmentRepository.updateEmployeeDepartment(): no employee updated, employee id[%d]",
          employee.id);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSQLDepartmentRepository.updateEmployeeDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
  }
  /**
   * Deletes a department by its id.
   *
   * @param id the id of the department to be deleted
   * @returns void
   */
  async deleteDepartment(id: number) {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(constants.CALL_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL, [id]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSQLDepartmentRepository.deleteDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSQLDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers the employees from source department to target department.
   * 
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the transferred employees array
   * @returns void
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]) {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(constants.CALL_TRANSFER_EMPLOYEES_SQL,
        [sourceDepartmentId, targetDepartmentId, employeeIds]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSQLDepartmentRepository.transferEmployees():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSQLDepartmentRepository.transferEmployees(): " +
      "transferred employees count[%d], source department id[%d], target department id[%d]",
      employeeIds.length, sourceDepartmentId, targetDepartmentId);
  }
}