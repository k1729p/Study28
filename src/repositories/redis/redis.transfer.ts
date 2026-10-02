import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { clientPromise } from "./redis.pool.js";
import { buildEmployeeKey } from "./redis.mappers.js";
import * as constants from "./redis.constants.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class RedisTransfer implements Transfer {
  /**
   * Transfers employees from a source department to a target department.
   *
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    const client = await clientPromise;
    try {
      const employeeKeys = employeeIds.map(buildEmployeeKey);
      await client.eval(constants.TRANSFER_EMPLOYEES_LUA, {
        keys: employeeKeys,
        arguments: [String(sourceDepartmentId), String(targetDepartmentId)]
      });
      console.log("RedisTransfer.transferEmployees(): " +
        "source department id[%d], target department id[%d], employees count[%d]",
        sourceDepartmentId, targetDepartmentId, employeeIds.length);
    } catch (err) {
      console.error("RedisTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    }
  }
}