import { Employee } from "../models/employee.js";
import { RepositoryType } from '../repositories/repository-type.js';
import { InitializationService } from './initialization.service.js';
import { DepartmentService } from './department.service.js';
import { EmployeeService } from './employee.service.js';
import { INITIAL_DATA } from './initial-data.js';
import { describe, beforeAll, it, expect, assert } from "vitest";

/**
 * Unit tests for the {@link DepartmentService}.
 *
 * This test suite verifies that the {@link DepartmentService} functions correctly.
 */
describe.for([
  RepositoryType.PostgreSQL,
])('repository type %s', repositoryType => {
  const initializationService = new InitializationService();
  const employeeService = new EmployeeService();
  const TEST_DEPARTMENT = INITIAL_DATA[0];
  const TEST_EMPLOYEE = TEST_DEPARTMENT.employees[0];
  /**
   * Sets up the testing module for the DepartmentService.
   */
  beforeAll(async () => {
    await initializationService.loadInitialData(repositoryType, []);
  });
  /**
   * Verifies that the initial employee array is returned correctly.
   * Checks that the result is an array, contains elements, and the first employee has the expected first name.
   */
  it('should return initial employee array', async () => {
    // GIVEN
    // WHEN
    const actualEmployees = await employeeService.getEmployees(repositoryType);
    // THEN
    checkEmployees(TEST_EMPLOYEE, actualEmployees);
  });
  /**
   * Checks if a specific employee can be retrieved by department and employee ID.
   * Verifies that the returned employee exists and has the expected first name.
   */
  it('should get a specific employee by id', async () => {
    // GIVEN
    // WHEN
    const actualEmployee = await employeeService.getEmployee(repositoryType, TEST_EMPLOYEE.id);
    // THEN
    checkEmployee(TEST_EMPLOYEE, actualEmployee);
  });
  /**
   * Tests the recreation of an employee.
   */
  describe('should recreate an employee', () => {
    /**
     * Tests deleting an employee from a department.
     * Ensures the employee is removed and cannot be retrieved.
     */
    it('should delete an employee', async () => {
      // GIVEN
      // WHEN
      await employeeService.deleteEmployee(repositoryType, TEST_EMPLOYEE.id);
      // THEN
      const actualEmployee = await employeeService.getEmployee(repositoryType, TEST_EMPLOYEE.id);
      expect(actualEmployee).toBeUndefined();
    });
    /**
     * Tests the creation of a new employee in a department.
     * Ensures the created employee is added and matches the test data.
     */
    it('should create a new employee in a department', async () => {
      // GIVEN
      // WHEN
      await employeeService.createEmployee(repositoryType, TEST_EMPLOYEE);
      // THEN
      const actualEmployee = await employeeService.getEmployee(repositoryType, TEST_EMPLOYEE.id);
      checkEmployee(TEST_EMPLOYEE, actualEmployee);
    });
  });
  /**
   * Tests updating an employee's information.
   * Verifies that the employee's data is updated by checking the new first name.
   */
  it('should update an employee', async () => {
    // GIVEN
    const UPDATED_NAME = 'Updated Emp Name';
    const updatedEmployee = { ...TEST_EMPLOYEE, firstName: UPDATED_NAME };
    // WHEN
    await employeeService.updateEmployee(repositoryType, updatedEmployee);
    // THEN
    const actualEmployee = await employeeService.getEmployee(repositoryType, TEST_EMPLOYEE.id);
    expect(actualEmployee?.firstName).toBe(UPDATED_NAME);
  });
  /**
   * Checks the actual employees.
   * Used for test assertions.
   * @param expectedEmployee the expected employee
   * @param actualEmployees the actual employees
   * @returns void
   */
  function checkEmployees(expectedEmployee: Employee, actualEmployees: Employee[]) {
    assert.isArray(actualEmployees);
    expect(actualEmployees).toHaveLength(INITIAL_DATA.length * INITIAL_DATA[0].employees.length);
    const actualEmployee = actualEmployees.find(emp => emp.id === expectedEmployee.id);
    checkEmployee(expectedEmployee, actualEmployee);
  }
  /**
   * Checks that the actual employee matches the expected employee.
   * Used for test assertions.
   * @param expectedEmployee the expected employee
   * @param actualEmployee the actual employee
   * @returns void
   */
  function checkEmployee(expectedEmployee: Employee, actualEmployee: Employee | undefined) {

    expect(actualEmployee).toBeDefined();
    expect(actualEmployee?.id).toBe(expectedEmployee.id);
    expect(actualEmployee?.firstName).toBe(expectedEmployee.firstName);
    expect(actualEmployee?.lastName).toBe(expectedEmployee.lastName);

    expect(actualEmployee?.title).toBe(expectedEmployee.title);
    expect(actualEmployee?.phone).toBe(expectedEmployee.phone);
    expect(actualEmployee?.mail).toBe(expectedEmployee.mail);
    expect(actualEmployee?.streetName).toBe(expectedEmployee.streetName);
    expect(actualEmployee?.houseNumber).toBe(expectedEmployee.houseNumber);
    expect(actualEmployee?.postalCode).toBe(expectedEmployee.postalCode);
    expect(actualEmployee?.locality).toBe(expectedEmployee.locality);
    expect(actualEmployee?.province).toBe(expectedEmployee.province);
    expect(actualEmployee?.country).toBe(expectedEmployee.country);
  }
});

