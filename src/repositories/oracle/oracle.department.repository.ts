import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { DepartmentRepository } from "../department.repository.js";
import { poolPromise } from "./oracle.pool.js";
import { parametersForDepartment } from "./oracle.mappers.js";
import * as mappers from "../mappers.js";
import * as constants from "./oracle.constants.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export class OracleDepartmentRepository implements DepartmentRepository {
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
      await connection.execute(constants.INSERT_DEPARTMENT_SQL, parametersForDepartment(department), { autoCommit: true });
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
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.SELECT_DEPARTMENTS_SQL);
      const rows = result.rows as any[] || [];
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
      console.log("OracleDepartmentRepository.getDepartments(): departments count[%d]", departments.length);
      return departments;
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
  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.SELECT_DEPARTMENT_SQL, { id });
      const rows = result.rows as any[] || [];
      if (!rows.length) {
        console.log("OracleDepartmentRepository.getDepartment(): department not found, department id[%d]", id);
        return undefined;
      }
      const department = mappers.mapDatabaseRowToDepartment(rows[0]);
      for (const row of rows) {
        if (row.employee_id) {
          department.employees.push(mappers.mapDatabaseRowToEmployee(row, false));
        }
      }
      console.log("OracleDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("OracleDepartmentRepository.getDepartment():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleDepartmentRepository.getDepartment(): error closing connection", err);
      }
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
      const result = await connection.execute(constants.UPDATE_DEPARTMENT_SQL, parametersForDepartment(department));
      if (!result.rowsAffected) {
        await connection.rollback();
        console.log("OracleDepartmentRepository.updateDepartment(): department not updated, department id[%d]",
          department.id);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("OracleDepartmentRepository.updateDepartment():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleDepartmentRepository.updateDepartment(): error closing connection", err);
      }
    }
    for (const employee of department.employees) {
      await this.updateEmployeeInDepartment(employee);
    }
    console.log("OracleDepartmentRepository.updateDepartment(): department id[%d]", department.id);
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
      const result = await connection.execute(constants.UPDATE_EMPLOYEE_DEPARTMENT_SQL, {
        departmentId: employee.departmentId,
        id: employee.id
      });
      if (!result.rowsAffected) {
        await connection.rollback();
        console.log("OracleDepartmentRepository.updateEmployeeInDepartment(): " +
          "employee not updated, employee id[%d], departmentId[%d]", employee.id, employee.departmentId);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("OracleDepartmentRepository.updateEmployeeInDepartment():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleDepartmentRepository.updateEmployeeInDepartment(): error closing connection", err);
      }
    }
  }
  /**
   * Deletes a department by its ID.
   * The removal of the department together with all its employees is delegated to the
   * 'delete_department_and_employees' PL/SQL stored procedure, so both DELETE statements
   * are executed atomically inside the database in a single round-trip.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.execute(constants.CALL_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL, { departmentId: id },
        { autoCommit: true });
    } catch (err) {
      console.error("OracleDepartmentRepository.deleteDepartment():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleDepartmentRepository.deleteDepartment(): error closing connection", err);
      }
    }
    console.log("OracleDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers employees from a source department to a target department.
   * The transfer is delegated to the 'transfer_employees' PL/SQL stored procedure. The list of
   * employee ids is bound using the built-in Oracle collection type SYS.ODCINUMBERLIST, which lets
   * the procedure perform a single, set-based UPDATE (via the TABLE() collection operator) instead
   * of one round-trip per employee, while keeping the operation atomic.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]):
    Promise<void> {
    if (employeeIds.length === 0) {
      console.warn("OracleDepartmentRepository.transferEmployees(): no employee ids provided, nothing to transfer");
      return;
    }
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const bindParams = {
        sourceDepartmentId,
        targetDepartmentId,
        employeeIds: { type: "SYS.ODCINUMBERLIST", val: employeeIds }
      };
      await connection.execute(constants.CALL_TRANSFER_EMPLOYEES_SQL, bindParams, { autoCommit: true });
    } catch (err) {
      console.error("OracleDepartmentRepository.transferEmployees():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleDepartmentRepository.transferEmployees(): error closing connection", err);
      }
    }
    console.log("OracleDepartmentRepository.transferEmployees(): " +
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}
