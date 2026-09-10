import { describe, it, beforeAll, afterEach, expect } from "vitest";

import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { TransferService } from '../transfer.service.js';
import { INITIAL_DATA, MAX_INT_32, MAX_BATCH_EMPLOYEE_IDS } from '../services.constants.js';
import { checkSuccessfulTransfer, checkFailedTransfer } from './checkers.js';

/**
 * Unit tests for the {@link TransferService}.
 * This test suite verifies that the {@link TransferService} functions correctly.
 * @param repositoryType the repository type
 */
export function transferServiceTests(repositoryType: RepositoryType) {
  const initializationService = new InitializationService();
  const departmentService = new DepartmentService();
  const transferService = new TransferService();
  const TEST_1ST_DEPARTMENT = INITIAL_DATA[0];
  const TEST_2ND_DEPARTMENT = INITIAL_DATA[1];
  const TEST_LAST_DEPARTMENT = INITIAL_DATA[INITIAL_DATA.length - 1];
  const TEST_ALL_EMPLOYEE_IDS = TEST_1ST_DEPARTMENT.employees.map(emp => emp.id);
  const TEST_1ST_EMPLOYEE_ID = TEST_1ST_DEPARTMENT.employees[0].id;
  const TEST_LAST_EMPLOYEE_ID = TEST_LAST_DEPARTMENT.employees[TEST_LAST_DEPARTMENT.employees.length - 1].id;
  const UNKNOWN_REPOSITORY_TYPE = 'UnknownRepositoryType' as RepositoryType;

  /**
   * Sets up the testing module for the TransferService.
   */
  beforeAll(async () => {
    await initializationService.loadInitialData(repositoryType, []);
  }, 90_000);

  /**
   * Suite of tests for the successful transfer of employees.
   */
  describe.for([
    ["all employees from first department to second department",
      TEST_1ST_DEPARTMENT, TEST_2ND_DEPARTMENT, TEST_ALL_EMPLOYEE_IDS],
    ["all employees from first department to last department",
      TEST_1ST_DEPARTMENT, TEST_LAST_DEPARTMENT, TEST_ALL_EMPLOYEE_IDS],
    ["first employee from first department to last department",
      TEST_1ST_DEPARTMENT, TEST_LAST_DEPARTMENT, [TEST_1ST_EMPLOYEE_ID]],
    ["last employee from last department to first department",
      TEST_LAST_DEPARTMENT, TEST_1ST_DEPARTMENT, [TEST_LAST_EMPLOYEE_ID]],
  ])('tests for transfer %s',
    ([info, testSourceDepartment, testTargetDepartment, testEmployeeIds]) => {
      /**
       * Tests transferring employees between departments.
       * Ensures the employee is removed from the source department and added to the target department.
       */
      it('should transfer employees between departments', async () => {
        // GIVEN
        const sourceDepartmentId = (testSourceDepartment as Department).id;
        const targetDepartmentId = (testTargetDepartment as Department).id;
        const transferredEmployeeIds = testEmployeeIds as number[];
        const expectedSrcEmpCount = (testSourceDepartment as Department).employees.length - transferredEmployeeIds.length;
        const expectedTrgEmpCount = (testTargetDepartment as Department).employees.length + transferredEmployeeIds.length;
        // WHEN
        await transferService.transferEmployees(
          repositoryType, sourceDepartmentId, targetDepartmentId, transferredEmployeeIds);
        // THEN
        const actualSourceDepartment = await departmentService.getDepartment(repositoryType, sourceDepartmentId);
        const actualTargetDepartment = await departmentService.getDepartment(repositoryType, targetDepartmentId);
        checkSuccessfulTransfer(transferredEmployeeIds, actualSourceDepartment, actualTargetDepartment,
          expectedSrcEmpCount, expectedTrgEmpCount);
      });
      /**
       * Cleanup after test.
       */
      afterEach(async () => {
        await initializationService.loadInitialData(repositoryType, []);
      }, 90_000);
    });

  /**
   * Suite of tests for the transfer with no valid employee IDs provided.
   */
  describe.for([
    ["no employee IDs provided",
      TEST_1ST_DEPARTMENT, TEST_LAST_DEPARTMENT, []],
    ["not existing employee IDs provided",
      TEST_1ST_DEPARTMENT, TEST_LAST_DEPARTMENT, [0, 12345, 67890]],
  ])('tests for valid employees - %s',
    ([info, testSourceDepartment, testTargetDepartment, testEmployeeIds]) => {
      /**
       * Tests transferring employees between departments.
       */
      it('should not transfer employees between departments', async () => {
        // GIVEN
        const sourceDepartmentId = (testSourceDepartment as Department).id;
        const targetDepartmentId = (testTargetDepartment as Department).id;
        const transferredEmployeeIds = testEmployeeIds as number[];
        const expectedSrcEmpCount = (testSourceDepartment as Department).employees.length;
        const expectedTrgEmpCount = (testTargetDepartment as Department).employees.length;
        // WHEN
        await transferService.transferEmployees(
          repositoryType, sourceDepartmentId, targetDepartmentId, transferredEmployeeIds);
        // THEN
        const actualSourceDepartment = await departmentService.getDepartment(repositoryType, sourceDepartmentId);
        const actualTargetDepartment = await departmentService.getDepartment(repositoryType, targetDepartmentId);
        checkFailedTransfer(transferredEmployeeIds, actualSourceDepartment, actualTargetDepartment,
          expectedSrcEmpCount, expectedTrgEmpCount);
      });
    });

  /**
   * Tests transferring employees using the same department.
   */
  it('should not transfer employees when source and target is the same department', async () => {
    // GIVEN
    // WHEN
    await transferService.transferEmployees(
      repositoryType, TEST_1ST_DEPARTMENT.id, TEST_1ST_DEPARTMENT.id, TEST_ALL_EMPLOYEE_IDS);
    // THEN
    const actualDepartment = await departmentService.getDepartment(repositoryType, TEST_1ST_DEPARTMENT.id);
    expect(actualDepartment).toBeDefined();
    expect(actualDepartment?.employees).toHaveLength(TEST_1ST_DEPARTMENT.employees.length);
    TEST_ALL_EMPLOYEE_IDS.forEach(employeeId => {
      expect(actualDepartment?.employees.find(emp => emp.id === employeeId)).toBeDefined();
    });
  });

  /**
   * Suite of tests for the transfer when ID is out of range.
   */
  describe.for([
    ["source department ID is below the minimum limit",
      0, TEST_2ND_DEPARTMENT.id, TEST_ALL_EMPLOYEE_IDS],
    ["source department ID is above the maximum limit",
      MAX_INT_32 + 1, TEST_2ND_DEPARTMENT.id, TEST_ALL_EMPLOYEE_IDS],
    ["target department ID is below the minimum limit",
      TEST_1ST_DEPARTMENT.id, 0, TEST_ALL_EMPLOYEE_IDS],
    ["target department ID is above the maximum limit",
      TEST_1ST_DEPARTMENT.id, MAX_INT_32 + 1, TEST_ALL_EMPLOYEE_IDS],
    ["employee IDs array size is above the maximum limit",
      TEST_1ST_DEPARTMENT.id, TEST_2ND_DEPARTMENT.id, new Array(MAX_BATCH_EMPLOYEE_IDS + 1)],
  ])('tests for out of range error -  %s',
    ([info, testSourceDepartmentId, testTargetDepartmentId, testEmployeeIds]) => {
      /**
       * Tests the failed transferring of employees between departments when ID is out of range.
       */
      it('should throw RangeError and not transfer employees', async () => {
        // GIVEN
        const transferredEmployeeIds = testEmployeeIds as number[];
        // WHEN / THEN
        await expect(
          transferService.transferEmployees(
            repositoryType, testSourceDepartmentId as number, testTargetDepartmentId as number, transferredEmployeeIds)
        ).rejects.toThrow(RangeError);
      });
    });

  /**
   * Test the failed transferring of employees between departments
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not transfer employees for an unknown repository type', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      transferService.transferEmployees(
        UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT.id, TEST_2ND_DEPARTMENT.id, TEST_ALL_EMPLOYEE_IDS)
    ).rejects.toThrow(ReferenceError);
  });
}
