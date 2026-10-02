import { describe, it, expect } from "vitest";

import { InitializationService } from '../../services/initialization.service.js';
import { DepartmentService } from '../../services/department.service.js';
import { EmployeeService } from '../../services/employee.service.js';
import { TransferService } from '../../services/transfer.service.js';
import { getSuiteNameInYellow } from '../tests.helpers.js';
import {
  TEST_1ST_DEPARTMENT,
  TEST_2ND_DEPARTMENT,
  TEST_1ST_EMPLOYEE,
  TEST_ALL_EMPLOYEE_IDS,
  UNKNOWN_REPOSITORY_TYPE
} from '../tests.constants.js';

/**
 * Unit tests for the unknown repository type
 */
export function serviceTestsWithUnknownRepository() {
  /**
   * Suite of tests with unknown repository for initialization service.
   */
  describe(getSuiteNameInYellow('Initialization Service'), () => {
    const initializationService = new InitializationService();
    /**
     * Test the failed initialization
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not initialize dataset', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        initializationService.loadInitialData(UNKNOWN_REPOSITORY_TYPE, [])
      ).rejects.toThrow(ReferenceError);
    });
  });

  /**
   * Suite of tests with unknown repository for department service.
   */
  describe(getSuiteNameInYellow('Department Service'), () => {
    const departmentService = new DepartmentService();
    /**
     * Tests the failed creation of a department
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not create a department', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        departmentService.createDepartment(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed retrieval of departments
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not get departments', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        departmentService.getDepartments(UNKNOWN_REPOSITORY_TYPE)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed retrieval of a department by its ID
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not get a department', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        departmentService.getDepartment(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT.id)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed update of a department
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not update a department', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        departmentService.updateDepartment(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed deletion of a department by its ID
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not delete a department', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        departmentService.deleteDepartment(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT.id)
      ).rejects.toThrow(ReferenceError);
    });
  });

  /**
   * Suite of tests with unknown repository for employee service.
   */
  describe(getSuiteNameInYellow('Employee Service'), () => {
    const employeeService = new EmployeeService();
    /**
     * Tests the failed creation of an employee
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not create an employee', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        employeeService.createEmployee(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_EMPLOYEE)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed retrieval of employees
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not get employees', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        employeeService.getEmployees(UNKNOWN_REPOSITORY_TYPE)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed retrieval of an employee by its ID
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not get an employee', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        employeeService.getEmployee(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_EMPLOYEE.id)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed update of an employee
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not update an employee', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        employeeService.updateEmployee(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_EMPLOYEE)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed deletion of an employee by its ID
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not delete an employee', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        employeeService.deleteEmployee(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_EMPLOYEE.id)
      ).rejects.toThrow(ReferenceError);
    });
  });

  /**
   * Suite of tests with unknown repository for transfer service.
   */
  describe(getSuiteNameInYellow('Transfer Service'), () => {
    const transferService = new TransferService();
    /**
     * Test the failed transferring of employees between departments
     * with an unimplemented repository type.
     */
    it('should throw ReferenceError and not transfer employees', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        transferService.transferEmployees(
          UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT.id, TEST_2ND_DEPARTMENT.id, TEST_ALL_EMPLOYEE_IDS)
      ).rejects.toThrow(ReferenceError);
    });
  });
}