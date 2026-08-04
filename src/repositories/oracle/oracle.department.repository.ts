import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { poolPromise } from "./oracle.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import * as helpers from "../../utils/helpers.js";
import * as constants from "./oracle.constants.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class OracleDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(department: Department): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      await connection.execute(constants.INSERT_DEPARTMENT_SQL, constants.BIND_PARAMETERS_FOR_DEPARTMENT(department), { autoCommit: true });
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
      const result = await connection.execute(constants.SELECT_DEPARTMENTS_SQL);
      const departmentMap = new Map<number, Department>();
      const rows = result.rows as any[] || [];

      for (const row of rows) {
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
  /**
   * Gets the department by id.
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.SELECT_DEPARTMENT_SQL, { id });
      const rows = result.rows as any[] || [];
      if (!rows.length) {
        console.log("OracleDepartmentRepository.getDepartment(): no department found with id[%d]", id);
        return undefined;
      }
      const department = helpers.mapDatabaseRowToDepartment(rows[0]);
      for (const row of rows) {
        if (row.employee_id) {
          department.employees.push(helpers.mapDatabaseRowToEmployee(row, false));
        }
      }
      console.log("OracleDepartmentRepository.getDepartment(): id[%d]", id);
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
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(department: Department): Promise<void> {
    const pool = await poolPromise;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(constants.UPDATE_DEPARTMENT_SQL, constants.BIND_PARAMETERS_FOR_DEPARTMENT(department));
      if (!result.rowsAffected) {
        await connection.rollback();
        console.log("OracleDepartmentRepository.updateDepartment(): no department updated with id[%d]",
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
      await this.updateEmployeeDepartment(employee);
    }
    console.log("OracleDepartmentRepository.updateDepartment(): department id[%d]", department.id);
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
      const result = await connection.execute(constants.UPDATE_EMPLOYEE_DEPARTMENT_SQL, {
        departmentId: employee.departmentId,
        id: employee.id
      });
      if (!result.rowsAffected) {
        await connection.rollback();
        console.log("OracleDepartmentRepository.updateEmployeeDepartment(): no employee updated, employee id[%d]",
          employee.id);
        return;
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      console.error("OracleDepartmentRepository.updateEmployeeDepartment():", err);
      throw err;
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleDepartmentRepository.updateEmployeeDepartment(): error closing connection", err);
      }
    }
  }
  /**
   * Deletes a department by its id.
   *
   * The removal of the department together with all its employees is delegated to the
   * 'delete_department_and_employees' PL/SQL stored procedure, so both DELETE statements
   * are executed atomically inside the database in a single round-trip.
   *
   * @param id the id of the department to be deleted
   * @returns void
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
   * Transfers the employees from source department to target department.
   *
   * The transfer is delegated to the 'transfer_employees' PL/SQL stored procedure. The list of
   * employee ids is bound using the built-in Oracle collection type SYS.ODCINUMBERLIST, which lets
   * the procedure perform a single, set-based UPDATE (via the TABLE() collection operator) instead
   * of one round-trip per employee, while keeping the operation atomic.
   *
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the transferred employees array
   * @returns void
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]):
    Promise<void> {
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
      "transferred employees count[%d], source department id[%d], target department id[%d]",
      employeeIds.length, sourceDepartmentId, targetDepartmentId);
  }
}
