import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { poolPromise } from "./mysql.pool.js";
import { repositoryLock } from "./mysql.initialization.js";
import * as constants from "./mysql.constants.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class MySqlTransfer implements Transfer {
  /**
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    const releaseRepositoryLock = await repositoryLock.acquireShared();
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
      console.error("MySqlTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    } finally {
      connection.release();
      releaseRepositoryLock();
    }
    console.log("MySqlTransfer.transferEmployees(): " +
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}