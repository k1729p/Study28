import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { TransferService } from '../transfer.service.js';
import { INITIAL_DATA } from '../services.constants.js';
import { describe, beforeAll, beforeEach, it, expect } from "vitest";

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
  // NEW: the LAST department in the array, used as a second source/target
  // so tests aren't only ever exercised against INITIAL_DATA[0]/[1].
  const TEST_LAST_DEPARTMENT = INITIAL_DATA[INITIAL_DATA.length - 1];
  // NEW: a repository type that is never registered in the strategies map.
  const UNKNOWN_REPOSITORY_TYPE = 'UnknownRepositoryType' as RepositoryType;

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

  // NEW: edge-case scenarios. Each test in this block reloads INITIAL_DATA
  // fresh beforehand so it is independent of the mutations performed by the
  // tests above (which move employees between department 1 and 2).
  describe('edge cases for transferring employees', () => {
    beforeEach(async () => {
      await initializationService.loadInitialData(repositoryType, []);
    }, 90_000);

    it('should transfer just the last employee of the source department', async () => {
      // GIVEN a single employee id - the LAST one in the source department -
      // instead of the whole department's employee list.
      const sourceEmployees = TEST_SRC_DEPARTMENT.employees;
      const lastEmployeeId = sourceEmployees[sourceEmployees.length - 1].id;
      // WHEN
      await transferService.transferEmployees(
        repositoryType, TEST_SRC_DEPARTMENT.id, TEST_TRG_DEPARTMENT.id, [lastEmployeeId]);
      // THEN
      const actualSourceDepartment = await departmentService.getDepartment(repositoryType, TEST_SRC_DEPARTMENT.id);
      const actualTargetDepartment = await departmentService.getDepartment(repositoryType, TEST_TRG_DEPARTMENT.id);
      expect(actualSourceDepartment?.employees.find(emp => emp.id === lastEmployeeId)).toBeUndefined();
      expect(actualTargetDepartment?.employees.find(emp => emp.id === lastEmployeeId)).toBeDefined();
      // The other employees of the source department must remain untouched.
      expect(actualSourceDepartment?.employees).toHaveLength(sourceEmployees.length - 1);
    });

    it('should do nothing when the employee id array is empty', async () => {
      // GIVEN
      const emptyIds: number[] = [];
      // WHEN
      await transferService.transferEmployees(
        repositoryType, TEST_SRC_DEPARTMENT.id, TEST_TRG_DEPARTMENT.id, emptyIds);
      // THEN both departments must keep their original employee counts.
      const actualSourceDepartment = await departmentService.getDepartment(repositoryType, TEST_SRC_DEPARTMENT.id);
      const actualTargetDepartment = await departmentService.getDepartment(repositoryType, TEST_TRG_DEPARTMENT.id);
      expect(actualSourceDepartment?.employees).toHaveLength(TEST_SRC_DEPARTMENT.employees.length);
      expect(actualTargetDepartment?.employees).toHaveLength(TEST_TRG_DEPARTMENT.employees.length);
    });

    it('should not lose or duplicate employees when a mix of valid and invalid ids is given', async () => {
      // GIVEN one real employee id from the source department plus ids that
      // don't exist anywhere.
      const validEmployeeId = TEST_SRC_DEPARTMENT.employees[0].id;
      const mixedIds = [validEmployeeId, -1, 424242];
      // WHEN
      await transferService.transferEmployees(
        repositoryType, TEST_SRC_DEPARTMENT.id, TEST_TRG_DEPARTMENT.id, mixedIds);
      // THEN only the valid id actually moves.
      const actualSourceDepartment = await departmentService.getDepartment(repositoryType, TEST_SRC_DEPARTMENT.id);
      const actualTargetDepartment = await departmentService.getDepartment(repositoryType, TEST_TRG_DEPARTMENT.id);
      expect(actualSourceDepartment?.employees.find(emp => emp.id === validEmployeeId)).toBeUndefined();
      expect(actualTargetDepartment?.employees.find(emp => emp.id === validEmployeeId)).toBeDefined();
      expect(actualSourceDepartment?.employees).toHaveLength(TEST_SRC_DEPARTMENT.employees.length - 1);
      expect(actualTargetDepartment?.employees).toHaveLength(TEST_TRG_DEPARTMENT.employees.length + 1);
    });

    it('should not change employee counts when source and target department are the same', async () => {
      // GIVEN a transfer where source === target - a degenerate but legal
      // input the current implementation doesn't explicitly guard against.
      const employeeIds = TEST_SRC_DEPARTMENT.employees.map(emp => emp.id);
      // WHEN
      await transferService.transferEmployees(
        repositoryType, TEST_SRC_DEPARTMENT.id, TEST_SRC_DEPARTMENT.id, employeeIds);
      // THEN no employees should be lost or duplicated.
      const actualDepartment = await departmentService.getDepartment(repositoryType, TEST_SRC_DEPARTMENT.id);
      expect(actualDepartment?.employees).toHaveLength(TEST_SRC_DEPARTMENT.employees.length);
      employeeIds.forEach(employeeId => {
        expect(actualDepartment?.employees.filter(emp => emp.id === employeeId)).toHaveLength(1);
      });
    });

    it('should resolve without throwing when the target department does not exist', async () => {
      // GIVEN a target department id that was never loaded.
      const nonExistentTargetId = 999_999;
      const employeeIds = [TEST_SRC_DEPARTMENT.employees[0].id];
      // WHEN / THEN
      // This documents the current contract rather than assuming a specific
      // outcome (silently no-op vs. moving the employee into a "floating"
      // record) - verify the actual behavior per repository before relying
      // on it, since it may differ across the 10 backends.
      await expect(
        transferService.transferEmployees(repositoryType, TEST_SRC_DEPARTMENT.id, nonExistentTargetId, employeeIds)
      ).resolves.not.toThrow();
    });

    it('should resolve without throwing when the source department does not exist', async () => {
      // GIVEN a source department id that was never loaded.
      const nonExistentSourceId = 999_998;
      const employeeIds = [1, 2, 3];
      // WHEN / THEN
      await expect(
        transferService.transferEmployees(repositoryType, nonExistentSourceId, TEST_TRG_DEPARTMENT.id, employeeIds)
      ).resolves.not.toThrow();
      // The real target department must remain unaffected.
      const actualTargetDepartment = await departmentService.getDepartment(repositoryType, TEST_TRG_DEPARTMENT.id);
      expect(actualTargetDepartment?.employees).toHaveLength(TEST_TRG_DEPARTMENT.employees.length);
    });

    it('should transfer employees between the first and the LAST department', async () => {
      // GIVEN the first and last departments in the array, instead of only
      // ever exercising departments [0] and [1].
      const transferredEmployeeIds = TEST_SRC_DEPARTMENT.employees.map(emp => emp.id);
      // WHEN
      await transferService.transferEmployees(
        repositoryType, TEST_SRC_DEPARTMENT.id, TEST_LAST_DEPARTMENT.id, transferredEmployeeIds);
      // THEN
      const actualSourceDepartment = await departmentService.getDepartment(repositoryType, TEST_SRC_DEPARTMENT.id);
      const actualLastDepartment = await departmentService.getDepartment(repositoryType, TEST_LAST_DEPARTMENT.id);
      checkTransfer(transferredEmployeeIds, actualSourceDepartment, actualLastDepartment, true);
    });
  });

  // NEW: error / exception handling for an unregistered repository strategy.
  it('transferEmployees() should throw ReferenceError for an unimplemented repository type', async () => {
    await expect(
      transferService.transferEmployees(
        UNKNOWN_REPOSITORY_TYPE, TEST_SRC_DEPARTMENT.id, TEST_TRG_DEPARTMENT.id, [TEST_SRC_DEPARTMENT.employees[0].id])
    ).rejects.toThrow(ReferenceError);
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
