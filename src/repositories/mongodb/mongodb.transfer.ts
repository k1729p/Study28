import { Employee } from "../../models/employee.js";
import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { poolPromise } from "./mongodb.pool.js";
import { config } from "./../../configuration/configuration.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class MongoDbTransfer implements Transfer {
  /**
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    const filter = { departmentId: sourceDepartmentId, id: { $in: employeeIds } };
    const update = { $set: { departmentId: targetDepartmentId } };
    const client = await poolPromise;
    try {
      const database = client.db(config.mongoDbDatabase);
      const employeeCollection = database.collection<Employee>('employees');
      await employeeCollection.updateMany(filter, update);
    } catch (err) {
      console.error("MongoDbTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    }
    console.log("MongoDbTransfer.transferEmployees(): " +
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}