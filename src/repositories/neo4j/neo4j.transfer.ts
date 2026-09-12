import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { driverPromise } from "./neo4j.pool.js";
import * as constants from "./neo4j.constants.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class Neo4jTransfer implements Transfer {
  /**
   * Transfers employees from a source department to a target department.
   *
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      await session.executeWrite(transaction => transaction.run(
        constants.TRANSFER_EMPLOYEES_QUERY,
        { sourceDepartmentId, targetDepartmentId, employeeIds }
      ));
    } catch (err) {
      console.error("Neo4jTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    } finally {
      await session.close();
    }
    console.log("Neo4jTransfer.transferEmployees(): " +
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}