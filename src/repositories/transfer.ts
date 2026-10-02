/**
 * Interface providing methods to transfer employees.
 */
export interface Transfer {
  /**
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  transferEmployees(
    sourceDepartmentId: number,
    targetDepartmentId: number,
    employeeIds: number[]
  ): Promise<void>;
}