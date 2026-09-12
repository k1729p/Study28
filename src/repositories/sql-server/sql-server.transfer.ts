import sql from 'mssql';

import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { poolPromise } from "./sql-server.pool.js";
import * as constants from "./sql-server.constants.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class SqlServerTransfer implements Transfer {
  /**
   * Transfers employees from a source department to a target department.
   * Delegates to the dbo.transfer_employees stored procedure.
   * The employee ids are sent as a Table-Valued Parameter (dbo.id_list_type) rather
   * than a delimited string or repeated round trips,
   * so the whole set of moves is validated, type-checked, and applied
   * by SQL Server in a single set-based, transactional statement.
   * In stored procedure the whole operation runs inside an explicit transaction
   * with TRY/CATCH error handling so that either all rows are moved, or none are (atomicity),
   * and any failure is reported back to the caller after the transaction has been safely rolled back.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
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
      console.error("SqlServerTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    }
    console.log("SqlServerTransfer.transferEmployees(): " +
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}