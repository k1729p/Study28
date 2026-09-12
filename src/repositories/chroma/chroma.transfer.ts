import type { Metadata } from "chromadb";

import { Transfer } from "../transfer.js";
import { RepositoryException } from "../repository-exception.js";
import { clientPromise } from "./chroma.pool.js";
import * as constants from "./chroma.constants.js";
/**
 * Repository class providing methods to transfers employees.
 */
export class ChromaTransfer implements Transfer {
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
    // This is a single batched request.
    try {
      const employeesCollection = await client.getOrCreateCollection(constants.EMPLOYEES_COLLECTION_OPTIONS);
      // With a `get()` call find the employees that both belong to the source department and appear in `employeeIds`.
      const employeeRows = await employeesCollection.get({
        ids: employeeIds.map(String),
        where: { [constants.DEPARTMENT_ID_FIELD]: sourceDepartmentId }
      });
      if (employeeRows.ids.length === 0) {
        console.warn("ChromaTransfer.transferEmployees(): " +
          "no matching employees found, source department id[%d]", sourceDepartmentId);
        return;
      }
      // With a batched `update()` call to the 'employeesCollection' reassign found employees to the target department
      // changing only the `departmentId` metadata field.
      const metadatas: Metadata[] = employeeRows.metadatas.map(metadata => ({
        ...(metadata ?? {}),
        [constants.DEPARTMENT_ID_FIELD]: targetDepartmentId
      }));
      await employeesCollection.update({
        ids: employeeRows.ids,
        metadatas: metadatas
      });
      console.log("ChromaTransfer.transferEmployees(): " +
        "source department id[%d], target department id[%d], employees count[%d]",
        sourceDepartmentId, targetDepartmentId, employeeIds.length);
    } catch (err) {
      console.error("ChromaTransfer.transferEmployees():", err);
      throw new RepositoryException(
        `Failed to transfer employees, sourceDepartmentId[${sourceDepartmentId}] targetDepartmentId[${targetDepartmentId}]`,
        { cause: err, operation: 'transferEmployees' }
      );
    }
  }
}