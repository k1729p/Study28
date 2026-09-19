import { describe, beforeAll, it, expect } from "vitest";

import { Employee } from "../../models/employee.js";
import { Title } from "../../models/title.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../../services/initialization.service.js';
import { EmployeeService } from '../../services/employee.service.js';
import { checkEmployees, checkEmployee } from '../checkers.js';
import {
  TEST_1ST_EMPLOYEE,
  TEST_LAST_EMPLOYEE,
  TEST_EMPLOYEE_CREATED,
  TEST_EMPLOYEE_UPDATED,
  TEST_EMPLOYEE_MINIMAL,
  TEST_EMPLOYEE_MAXIMAL,
  TEST_EMPLOYEE_ID_NOT_EXISTING,
  IDS_OUT_OF_RANGE
} from '../tests.constants.js';

/**
 * Unit tests for the {@link EmployeeService}.
 * This test suite verifies that the {@link EmployeeService} functions correctly.
 * @param repositoryType the repository type
 */
export function employeeServiceTests(repositoryType: RepositoryType) {
  const initializationService = new InitializationService();
  const employeeService = new EmployeeService();

  /**
   * Sets up the testing module for the EmployeeService.
   */
  beforeAll(async () => {
    await initializationService.loadInitialData(repositoryType, []);
  }, 90_000);

  /**
   * Suite of tests for the retrieval of employees.
   * Tests the retrieval of the first and the last employee in the initial dataset.
   */
  describe.for([
    ['first employee in first department', TEST_1ST_EMPLOYEE],
    ['last employee in last department', TEST_LAST_EMPLOYEE]
  ])('tests for retrieval %s', ([info, testEmployee]) => {
    const expectedEmployee = testEmployee as Employee;
    /**
     * Tests the retrieval of the initial employee array.
     * This test checks if the service can fetch an array of employees.
     */
    it('should return initial employee array', async () => {
      // GIVEN
      // WHEN
      const actualEmployees = await employeeService.getEmployees(repositoryType);
      // THEN
      checkEmployees(expectedEmployee, actualEmployees);
    });

    /**
     * Tests the retrieval of an employee by its ID.
     * This test checks if the service can fetch a employee by its ID.
     */
    it('should get a specific employee by id', async () => {
      // GIVEN
      // WHEN
      const actualEmployee = await employeeService.getEmployee(repositoryType, expectedEmployee.id);
      // THEN
      checkEmployee(expectedEmployee, actualEmployee);
    });
  });

  /**
   * Suite of tests for the employee's actions sequence: Create -> Update -> Delete
   */
  describe('tests for creating, updating, and deleting an employee', () => {
    /**
     * Tests the creation of a new employee in a department.
     * Ensures the created employee is added and matches the test data.
     */
    it('should create a new employee in a department', async () => {
      // GIVEN
      const expectedEmployee = TEST_EMPLOYEE_CREATED;
      // WHEN
      await employeeService.createEmployee(repositoryType, expectedEmployee);
      // THEN
      const actualEmployee = await employeeService.getEmployee(repositoryType, expectedEmployee.id);
      checkEmployee(expectedEmployee, actualEmployee);
    });
    /**
     * Tests updating an employee's information.
     * Verifies that the employee's data is updated.
     */
    it('should update an employee', async () => {
      // GIVEN
      const expectedEmployee = TEST_EMPLOYEE_UPDATED;
      // WHEN
      await employeeService.updateEmployee(repositoryType, expectedEmployee);
      // THEN
      const actualEmployee = await employeeService.getEmployee(repositoryType, expectedEmployee.id);
      checkEmployee(expectedEmployee, actualEmployee);
    });

    /**
     * Tests deleting an employee from a department.
     * Ensures the employee is removed and cannot be retrieved.
     */
    it('should delete an employee', async () => {
      // GIVEN
      const expectedEmployee = TEST_EMPLOYEE_CREATED;
      // WHEN
      await employeeService.deleteEmployee(repositoryType, expectedEmployee.id);
      // THEN
      const actualEmployee = await employeeService.getEmployee(repositoryType, expectedEmployee.id);
      expect(actualEmployee).toBeUndefined();
    });
  });

  /**
   * Tests for the creation of an employee with all possible titles.
   */
  it.each(Object.values(Title))('should create a new employee with title[%s]', async (titleValue) => {
    // GIVEN
    const expectedEmployee: Employee = {
      ...TEST_EMPLOYEE_CREATED,
      title: titleValue
    };
    // WHEN
    await employeeService.createEmployee(repositoryType, expectedEmployee);
    const actualEmployee = await employeeService.getEmployee(repositoryType, expectedEmployee.id);
    // THEN
    expect(actualEmployee).toBeDefined();
    expect(actualEmployee?.title).toBe(expectedEmployee.title);
    // Cleanup
    await employeeService.deleteEmployee(repositoryType, expectedEmployee.id);
  });

  /**
   * Suite of tests for the retrieval and deletion of an employee that does not exist.
   */
  describe.for([
    TEST_EMPLOYEE_ID_NOT_EXISTING
  ])('tests use not existing employee id[%d]', (id) => {
    /**
     * Tests the failed retrieval of an employee by its ID.
     */
    it('should not get an employee that does not exist', async () => {
      // GIVEN
      // WHEN
      const actualEmployee = await employeeService.getEmployee(repositoryType, id);
      // THEN
      expect(actualEmployee).toBeUndefined();
    });

    /**
     * Tests the failed deletion of an employee by its ID.
     */
    it('should not delete an employee that does not exist', async () => {
      // GIVEN / WHEN / THEN
      // Documents current contract: deleting an absent id must not throw.
      await expect(
        employeeService.deleteEmployee(repositoryType, id)
      ).resolves.not.toThrow();
    });
  });

  /**
   * Suite of tests for the minimal and maximal employee data.
   */
  describe('tests use minimal and maximal employee data', () => {
    /**
     * Tests the creation of an employee with only mandatory fields.
     */
    it('should create and retrieve an employee with only mandatory fields', async () => {
      // GIVEN
      const expectedEmployee = TEST_EMPLOYEE_MINIMAL;
      // WHEN
      await employeeService.createEmployee(repositoryType, expectedEmployee);
      const actualEmployee = await employeeService.getEmployee(repositoryType, expectedEmployee.id);
      // THEN
      expect(actualEmployee).toBeDefined();
      expect(actualEmployee?.id).toBe(expectedEmployee.id);
      expect(actualEmployee?.departmentId).toBe(expectedEmployee.departmentId);
      expect(actualEmployee?.firstName).toBe(expectedEmployee.firstName);
      expect(actualEmployee?.lastName).toBe(expectedEmployee.lastName);
      expect(actualEmployee?.streetName).toBeFalsy();
      expect(actualEmployee?.houseNumber).toBeFalsy();
      expect(actualEmployee?.postalCode).toBeFalsy();
      expect(actualEmployee?.locality).toBeFalsy();
      expect(actualEmployee?.province).toBeFalsy();
      expect(actualEmployee?.country).toBeFalsy();
      // Cleanup
      await employeeService.deleteEmployee(repositoryType, expectedEmployee.id);
    });

    /**
     * Tests the creation of an employee with maximal values in fields.
     */
    it('should create and retrieve an employee with maximal / edge-case field values', async () => {
      // GIVEN
      const expectedEmployee = TEST_EMPLOYEE_MAXIMAL;
      // WHEN
      await employeeService.createEmployee(repositoryType, expectedEmployee);
      const actualEmployee = await employeeService.getEmployee(repositoryType, expectedEmployee.id);
      // THEN
      checkEmployee(expectedEmployee, actualEmployee);
      // Cleanup
      await employeeService.deleteEmployee(repositoryType, expectedEmployee.id);
    });
  });

  /**
   * Suite of tests for the retrieval and deletion of an employee when ID is out of range.
   */
  describe.for(IDS_OUT_OF_RANGE)('tests uses out of range employee id[%d]', (id) => {
    /**
     * Tests the failed retrieval of an employee when ID is out of range.
     */
    it('should throw RangeError and not get an employee', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        employeeService.getEmployee(repositoryType, id)
      ).rejects.toThrow(RangeError);
    });

    /**
     * Tests the failed deletion of an employee when ID is out of range.
     */
    it('should throw RangeError and not delete an employee', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        employeeService.deleteEmployee(repositoryType, id)
      ).rejects.toThrow(RangeError);
    });
  });
}
