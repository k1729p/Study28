import { it, expect } from "vitest";

import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { EmployeeService } from '../employee.service.js';
import { TransferService } from '../transfer.service.js';
import { INITIAL_DATA } from '../services.constants.js';

/**
 * Unit tests for the unknown repository type
 */
export function unknownRepositoryTests() {
  const initializationService = new InitializationService();
  const departmentService = new DepartmentService();
  const employeeService = new EmployeeService();
  const transferService = new TransferService();

  const UNKNOWN_REPOSITORY_TYPE = 'UnknownRepositoryType' as RepositoryType;
  const TEST_1ST_DEPARTMENT = INITIAL_DATA[0];
  const TEST_2ND_DEPARTMENT = INITIAL_DATA[1];
  const TEST_1ST_EMPLOYEE = INITIAL_DATA[0].employees[0];
  const TEST_ALL_EMPLOYEE_IDS = TEST_1ST_DEPARTMENT.employees.map(emp => emp.id);

  /**
   * Test the failed initialization
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not initialize dataset with initialization service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      initializationService.loadInitialData(UNKNOWN_REPOSITORY_TYPE, [])
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed creation of a department
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not create a department with department service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      departmentService.createDepartment(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed retrieval of departments
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not get departments with department service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      departmentService.getDepartments(UNKNOWN_REPOSITORY_TYPE)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed retrieval of a department by its ID
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not get a department with department service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      departmentService.getDepartment(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT.id)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed update of a department
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not update a department with department service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      departmentService.updateDepartment(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed deletion of a department by its ID
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not delete a department with department service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      departmentService.deleteDepartment(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT.id)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed creation of an employee
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not create an employee with employee service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      employeeService.createEmployee(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_EMPLOYEE)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed retrieval of employees
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not get employees with employee service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      employeeService.getEmployees(UNKNOWN_REPOSITORY_TYPE)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed retrieval of an employee by its ID
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not get an employee with employee service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      employeeService.getEmployee(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_EMPLOYEE.id)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed update of an employee
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not update an employee with employee service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      employeeService.updateEmployee(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_EMPLOYEE)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Tests the failed deletion of an employee by its ID
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not delete an employee with employee service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      employeeService.deleteEmployee(UNKNOWN_REPOSITORY_TYPE, TEST_1ST_EMPLOYEE.id)
    ).rejects.toThrow(ReferenceError);
  });

  /**
   * Test the failed transferring of employees between departments
   * with an unimplemented repository type.
   */
  it('should throw ReferenceError and not transfer employees with transfer service', async () => {
    // GIVEN / WHEN / THEN
    await expect(
      transferService.transferEmployees(
        UNKNOWN_REPOSITORY_TYPE, TEST_1ST_DEPARTMENT.id, TEST_2ND_DEPARTMENT.id, TEST_ALL_EMPLOYEE_IDS)
    ).rejects.toThrow(ReferenceError);
  });
}

