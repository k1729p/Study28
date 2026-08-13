import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { TransferService } from '../transfer.service.js';
import { INITIAL_DATA } from '../initial-data.js';
import { beforeAll, it, expect } from "vitest";

/**
 * Unit tests for the {@link TransferService}.
 *
 * This test suite verifies that the {@link TransferService} functions correctly.
 * @param repositoryType the repository type
 */
export function transferServiceTests(repositoryType: RepositoryType) {
  const initializationService = new InitializationService();
  const departmentService = new DepartmentService();
  const transferService = new TransferService();
  const TEST_SRC_DEPARTMENT = INITIAL_DATA[0];
  const TEST_TRG_DEPARTMENT = INITIAL_DATA[1];
  /**
   * Sets up the testing module for the TransferService.
   */
  beforeAll(async () => {
    await initializationService.loadInitialData(repositoryType, []);
  }, 90_000);
  /**
   * Tests transferring employees between departments.
   * Ensures the employee is removed from the source department and added to the target department.
   */
  it('should transfer employees between departments', async () => {
    // GIVEN
    const transferredEmployeeIds = TEST_SRC_DEPARTMENT.employees.map(emp => emp.id);
    // WHEN
    await transferService.transferEmployees(
      repositoryType, TEST_SRC_DEPARTMENT.id, TEST_TRG_DEPARTMENT.id, transferredEmployeeIds);
    // THEN
    const actualSourceDepartment = await departmentService.getDepartment(repositoryType, TEST_SRC_DEPARTMENT.id);
    const actualTargetDepartment = await departmentService.getDepartment(repositoryType, TEST_TRG_DEPARTMENT.id);
    checkTransfer(transferredEmployeeIds, actualSourceDepartment, actualTargetDepartment, true);
  });
  /**
   * Tests transferring not existing employees between departments.
   */
  it('should not transfer employees between departments', async () => {
    // GIVEN
    const transferredEmployeeIds = [0, 12345, 67890];
    // WHEN
    await transferService.transferEmployees(
      repositoryType, TEST_SRC_DEPARTMENT.id, TEST_TRG_DEPARTMENT.id, transferredEmployeeIds);
    // THEN
    const actualSourceDepartment = await departmentService.getDepartment(repositoryType, TEST_SRC_DEPARTMENT.id);
    const actualTargetDepartment = await departmentService.getDepartment(repositoryType, TEST_TRG_DEPARTMENT.id);
    checkTransfer(transferredEmployeeIds, actualSourceDepartment, actualTargetDepartment, false);
  });
  /**
   * Checks transfer results.
   * 
   * @param transferredEmployeeIds the transferred employee ids
   * @param actualSourceDepartment the actual source department 
   * @param actualTargetDepartment the actual target department 
   */
  function checkTransfer(transferredEmployeeIds: number[],
    actualSourceDepartment: Department | undefined, actualTargetDepartment: Department | undefined,
    targetFlag: boolean) {

    expect(actualSourceDepartment).toBeDefined();
    transferredEmployeeIds.forEach(employeeId => {
      expect(actualSourceDepartment?.employees.find(emp => emp.id === employeeId)).toBeUndefined();
    });
    expect(actualTargetDepartment).toBeDefined();
    transferredEmployeeIds.forEach(employeeId => {
      if (targetFlag) {
        expect(actualTargetDepartment?.employees.find(emp => emp.id === employeeId)).toBeDefined();
      } else {
        expect(actualTargetDepartment?.employees.find(emp => emp.id === employeeId)).toBeUndefined();
      }
    });
  }
}