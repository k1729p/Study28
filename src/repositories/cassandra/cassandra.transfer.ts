import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { clientPromise } from "./cassandra.pool.js";
import { repositoryLock } from "./cassandra.initialization.js";
import * as constants from "./cassandra.constants.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class CassandraTransfer implements Transfer {
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
    try {
      const client = await clientPromise;
      // Step 1: read the full rows to move. 'department_id' (the partition key) is restricted
      // to a single value and 'id' (the clustering key) is restricted with IN, so this remains
      // a single, efficient single-partition read.
      const resultSet = await client.execute(constants.SELECT_EMPLOYEES_BY_DEPARTMENT_AND_IDS_CQL,
        { departmentId: sourceDepartmentId, ids: employeeIds }, { prepare: true });
      if (resultSet.rowLength === 0) {
        console.warn("CassandraTransfer.transferEmployees(): " +
          "no matching employees found, source department id[%d]", sourceDepartmentId);
        return;
      }
      // Deleting employee from the source partition and re-inserting it into the target partition.
      // A LOGGED BATCH is Cassandra's closest equivalent to an atomic server-side procedure for this:
      // the coordinator node first persists the batch to a distributed batchlog, which guarantees
      // that either all statements are eventually applied or none are, even if the coordinator
      // fails partway through - so an employee can never end up duplicated in, or missing from, both departments.
      const queries = resultSet.rows.flatMap(row => {
        const insertValues = [
          row.id,
          targetDepartmentId,
          row.first_name,
          row.last_name,
          row.title,
          row.phone,
          row.mail,
          row.street_name,
          row.house_number,
          row.postal_code,
          row.locality,
          row.province,
          row.country
        ];
        return [
          { query: constants.DELETE_EMPLOYEE_CQL, params: { departmentId: sourceDepartmentId, id: row.id } },
          { query: constants.INSERT_EMPLOYEE_CQL, params: insertValues }
        ];
      });
      await client.batch(queries, { prepare: true });
    } catch (err) {
      console.error("CassandraTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    } finally {
      releaseRepositoryLock();
    }
    console.log("CassandraTransfer.transferEmployees(): " +
      "source department id[%d], target department id[%d], employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}