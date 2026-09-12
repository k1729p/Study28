import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { poolPromise } from "./oracle.pool.js";
import * as constants from "./oracle.constants.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class OracleTransfer implements Transfer {
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
      console.error("OracleTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    } finally {
      try {
        await connection.close();
      } catch (err) {
        console.error("OracleTransfer.transferEmployees(): error closing connection", err);
      }
    }
    console.log("OracleTransfer.transferEmployees(): " +
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}