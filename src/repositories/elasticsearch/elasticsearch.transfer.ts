import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { clientPromise } from "./elasticsearch.pool.js";
import * as constants from "./elasticsearch.constants.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class ElasticsearchTransfer implements Transfer {
  /**
   * Transfers employees from a source department to a target department.
   * The 'update_by_query' API accepts a query to select the matching documents and
   * a Painless script to mutate each one in place. A single request therefore finds every employee
   * that belongs to the source department AND is listed in 'employeeIds', and reassigns their 'departmentId'
   * to the target department - without round-tripping documents through the client.
   * The 'ctx' is the per-document update context that Elasticsearch exposes to the script.
   * The 'ctx._source' is the document being updated. The 'params' are the values passed in from the request.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    const client = await clientPromise;
    try {
      await client.updateByQuery({
        index: constants.INDEX_EMPLOYEES,
        refresh: true,
        conflicts: 'proceed',
        query: {
          bool: {
            must: [
              { term: { ['departmentId']: sourceDepartmentId } },
              { terms: { ['id']: employeeIds } }
            ]
          }
        },
        script: {
          source: 'ctx._source.departmentId = params.targetDepartmentId',
          lang: 'painless',
          params: { targetDepartmentId }
        }
      });
      console.log("ElasticsearchTransfer.transferEmployees(): " +
        "source department id[%d], target department id[%d], employees count[%d]",
        sourceDepartmentId, targetDepartmentId, employeeIds.length);
    } catch (err) {
      console.error("ElasticsearchTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    }
  }
}