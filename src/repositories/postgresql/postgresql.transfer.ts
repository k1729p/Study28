import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { poolPromise } from "./postgresql.pool.js";
import * as constants from "./postgresql.constants.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class PostgreSqlTransfer implements Transfer {
  /**
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
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
      console.error("PostgreSqlTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    } finally {
      client.release();
    }
    console.log("PostgreSqlTransfer.transferEmployees(): " +
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}