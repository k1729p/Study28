import { RepositoryType } from '../repositories/repository-type.js';
import { TransferService } from './transfer.service.js';
import { InitializationService } from './initialization.service.js';
import { DepartmentService } from './department.service.js';
import { INITIAL_DATA } from './initial-data.js';
import { describe, beforeAll, it, expect, assert } from "vitest";

/**
 * Unit tests for the {@link DepartmentService}.
 *
 * This test suite sets up the Angular testing environment and verifies
 * that the {@link DepartmentService} can be instantiated and functions correctly.
 */
describe.for([
  RepositoryType.PostgreSQL,
]) ('repository type %s', repositoryType => {
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
  });
  /**
   * Tests transferring an employee between departments.
   * Ensures the employee is removed from the source department and added to the target department.
   */
  it('should transfer an employee between departments', async () => {
    // GIVEN
    const TRANSFERED_EMPLOYEE_IDS = TEST_SRC_DEPARTMENT.employees.map(emp => emp.id);
    // WHEN
    await transferService.transferEmployees(
      repositoryType,  TEST_SRC_DEPARTMENT.id, TEST_TRG_DEPARTMENT.id, TRANSFERED_EMPLOYEE_IDS);
    // THEN
    const actualSourceDepartment = await departmentService.getDepartment(repositoryType, TEST_SRC_DEPARTMENT.id);
    TRANSFERED_EMPLOYEE_IDS.forEach(employeeId => {
      expect(actualSourceDepartment?.employees.find(emp => emp.id === employeeId)).toBeUndefined();
    });
    const actualTargetDepartment = await departmentService.getDepartment(repositoryType, TEST_TRG_DEPARTMENT.id);
    TRANSFERED_EMPLOYEE_IDS.forEach(employeeId => {
      expect(actualTargetDepartment?.employees.find(emp => emp.id === employeeId)).toBeDefined();
    });
  });
});
