import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { DepartmentRepository } from "../department.repository.js";
import { poolPromise } from "./postgresql.pool.js";
import * as mappers from "../mappers.js";
import * as constants from "./postgresql.constants.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export class PostgreSqlDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  async createDepartment(department: Department) {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryResult = await client.query(constants.INSERT_DEPARTMENT_SQL, [
        department.id,
        department.name,
        department.startDate,
        department.endDate,
        department.notes,
        department.keywords,
        department.image
      ]);
      if (!queryResult.rowCount) {
        await client.query('ROLLBACK');
        console.log("PostgreSqlDepartmentRepository.createDepartment(): " +
          "department not created, department id[%d]",
          department.id);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSqlDepartmentRepository.createDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSqlDepartmentRepository.createDepartment(): department id[%s]", department.id);
  }
  /**
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const pool = await poolPromise;
    const client = await pool.connect();
    try {
      const queryResult = await client.query(constants.SELECT_DEPARTMENTS_SQL);
      const departmentMap = new Map<number, Department>();
      for (const row of queryResult.rows) {
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
      console.log("PostgreSqlDepartmentRepository.getDepartments(): departments count[%d]", departments.length);
      return departments;
    } catch (err) {
      console.error("PostgreSqlDepartmentRepository.getDepartments():", err);
      throw err;
    } finally {
      client.release();
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
    const client = await pool.connect();
    try {
      const result = await client.query(constants.SELECT_DEPARTMENT_SQL, [id]);
      if (!result.rowCount) {
        console.log("PostgreSqlDepartmentRepository.getDepartment(): " +
          "department not found, department id[%d]", id);
        return undefined;
      }
      const rows = result.rows;
      const department = mappers.mapDatabaseRowToDepartment(rows[0]);
      for (const row of rows) {
        if (row.employee_id) {
          department.employees.push(mappers.mapDatabaseRowToEmployee(row, false));
        }
      }
      console.log("PostgreSqlDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("PostgreSqlDepartmentRepository.getDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
  }
  /**
   * Updates an existing department.
   * 
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
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
        console.log("PostgreSqlDepartmentRepository.updateDepartment(): " +
          "department not updated, department id[%d]", department.id);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSqlDepartmentRepository.updateDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
    department.employees.forEach(employee => this.updateEmployeeInDepartment(employee));
    console.log("PostgreSqlDepartmentRepository.updateDepartment(): department id[%d]", department.id);
  }
  /**
   * Updates an employee in the department.
   * 
   * @param employee the employee
   * @returns void
   */
  private async updateEmployeeInDepartment(employee: Employee) {
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
        console.log("PostgreSqlDepartmentRepository.updateEmployeeInDepartment(): " +
          "employee not updated, employee id[%d], departmentId[%d]", employee.id, employee.departmentId);
        return;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("PostgreSqlDepartmentRepository.updateEmployeeInDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
  }
  /**
   * Deletes a department by its ID.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
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
      console.error("PostgreSqlDepartmentRepository.deleteDepartment():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSqlDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]) {
    if (employeeIds.length === 0) {
      console.warn("PostgreSqlDepartmentRepository.transferEmployees(): no employee ids provided, nothing to transfer");
      return;
    }
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
      console.error("PostgreSqlDepartmentRepository.transferEmployees():", err);
      throw err;
    } finally {
      client.release();
    }
    console.log("PostgreSqlDepartmentRepository.transferEmployees(): " +
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}