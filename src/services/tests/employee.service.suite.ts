import { Employee } from "../../models/employee.js";
import { Title } from "../../models/title.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { EmployeeService } from '../employee.service.js';
import { INITIAL_DATA, MAX_INT_32 } from '../services.constants.js';
import { describe, beforeAll, it, expect, assert } from "vitest";

/**
 * Unit tests for the {@link EmployeeService}.
 *
 * This test suite verifies that the {@link EmployeeService} functions correctly.
 * @param repositoryType the repository type
 */
export function employeeServiceTests(repositoryType: RepositoryType) {
  const initializationService = new InitializationService();
  const employeeService = new EmployeeService();

  const TEST_EMPLOYEE = INITIAL_DATA[0].employees[0];
  const TEST_DEPARTMENT_ID = INITIAL_DATA[0].id;

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
    [0, 0],
    [INITIAL_DATA.length - 1, INITIAL_DATA[INITIAL_DATA.length - 1].employees.length - 1]
  ])('retrieval tests use initial data department index[%d] and employee index[%d]',
    ([departmentIndex, employeeIndex]) => {

      const expectedEmployee = INITIAL_DATA[departmentIndex].employees[employeeIndex];
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
   * Suite of tests for the recreation of an employee in a department.
   */
  describe('should recreate an employee', () => {
    /**
     * Tests updating an employee's information.
     * Verifies that the employee's data is updated.
     */
    it('should update an employee', async () => {
      // GIVEN
      const expectedEmployee = {
        ...TEST_EMPLOYEE,
        firstName: 'Updated Employee First Name',
        lastName: 'Updated Employee Last Name'
      };
      // WHEN
      await employeeService.updateEmployee(repositoryType, expectedEmployee);
      // THEN
      const actualEmployee = await employeeService.getEmployee(repositoryType, TEST_EMPLOYEE.id);
      checkEmployee(expectedEmployee, actualEmployee);
    });

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
   * Tests for the creation of an employee with all possible titles.
   */
  it.each(Object.values(Title))('should persist an employee with title[%s]', async (titleValue) => {
    // GIVEN
    const expectedEmployee: Employee = {
      id: 5432100 + Object.values(Title).indexOf(titleValue),
      departmentId: TEST_DEPARTMENT_ID,
      firstName: 'FN',
      lastName: 'LN',
      title: titleValue,
      phone: '+1 000-000-0000',
      mail: `a@b.com`,
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
    Math.max(...INITIAL_DATA.flatMap(dept => dept.employees.map(emp => emp.id))) + 1
  ])('test uses not existing employee id[%d]', (id) => {
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
      // GIVEN
      // WHEN / THEN
      // Documents current contract: deleting an absent id must not throw.
      await expect(
        employeeService.deleteEmployee(repositoryType, id)
      ).resolves.not.toThrow();
    });
  });

  /**
   * Suite of tests for the retrieval and deletion of an employee when ID is out of range.
   */
  describe.for([
    0,
    MAX_INT_32 + 1
  ])('test uses out of range employee id[%d]', (id) => {
    /**
     * Tests the failed retrieval of an employee when ID is out of range.
     */
    it('should not get an employee when id is out of range', async () => {
      // GIVEN
      // WHEN / THEN
      await expect(
        employeeService.getEmployee(repositoryType, id)
      ).rejects.toThrow(RangeError);
    });

    /**
     * Tests the failed deletion of an employee when ID is out of range.
     */
    it('should not delete an employee when id is out of range', async () => {
      // GIVEN
      // WHEN / THEN
      await expect(
        employeeService.deleteEmployee(repositoryType, id)
      ).rejects.toThrow(RangeError);
    });
  });

  /**
   * Suite of tests for the minimal and maximal employee data.
   */
  describe('minimal and maximal employee data', () => {
    /**
     * Tests the creation of an employee with only mandatory fields.
     */
    it('should create and retrieve an employee with only mandatory fields', async () => {
      // GIVEN
      const expectedEmployee: Employee = {
        id: 5432103,
        departmentId: TEST_DEPARTMENT_ID,
        firstName: 'FN',
        lastName: 'LN',
        title: Title.Analyst,
        phone: '+1 000-000-0000',
        mail: 'a@b.com',
      };
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
      const expectedEmployee: Employee = {
        id: 5432104,
        departmentId: TEST_DEPARTMENT_ID,
        firstName: 'FN-ab12-'.repeat(5),
        lastName: 'LN-ab12-'.repeat(5),
        title: Title.Developer,
        phone: '+00 (000) 000-00-00 ext.99999',
        mail: 'a'.repeat(35) + '@' + 'b'.repeat(40) + '.com',
        streetName: 'ST-ab12-'.repeat(10),
        houseNumber: '012345-ABC'.repeat(2),
        postalCode: '0-123-456-'.repeat(2),
        locality: 'City/With Special-Chars & Ünïcödé 12',
        province: 'Province/With Spec-Chars & Ünïcödé 1',
        country: 'Country/With Spec-Chars & Ünïcödé 12',
      };
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
   * Suite of tests for an unregistered repository strategy.
   */
  describe.for([
    'UnknownRepositoryType' as RepositoryType
  ])('should throw for an unimplemented repository type', (unknownRepositoryType) => {
    /**
     * Tests the failed creation of an employee
     * with an unimplemented repository type.
     */
    it('createEmployee() should throw ReferenceError', async () => {
      await expect(
        employeeService.createEmployee(unknownRepositoryType, TEST_EMPLOYEE)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed retrieval of employees
     * with an unimplemented repository type.
     */
    it('getEmployees() should throw ReferenceError', async () => {
      await expect(
        employeeService.getEmployees(unknownRepositoryType)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed retrieval of an employee by its ID
     * with an unimplemented repository type.
     */
    it('getEmployee() should throw ReferenceError', async () => {
      await expect(
        employeeService.getEmployee(unknownRepositoryType, TEST_EMPLOYEE.id)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed update of an employee
     * with an unimplemented repository type.
     */
    it('updateEmployee() should throw ReferenceError', async () => {
      await expect(
        employeeService.updateEmployee(unknownRepositoryType, TEST_EMPLOYEE)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed deletion of an employee by its ID
     * with an unimplemented repository type.
     */
    it('deleteEmployee() should throw ReferenceError', async () => {
      await expect(
        employeeService.deleteEmployee(unknownRepositoryType, TEST_EMPLOYEE.id)
      ).rejects.toThrow(ReferenceError);
    });
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
    expect(actualEmployee?.departmentId).toBe(expectedEmployee.departmentId);
    expectedEmployee.firstName ?
      expect(actualEmployee?.firstName).toBe(expectedEmployee.firstName) :
      expect(actualEmployee?.firstName).toBeFalsy();
    expectedEmployee.lastName ?
      expect(actualEmployee?.lastName).toBe(expectedEmployee.lastName) :
      expect(actualEmployee?.lastName).toBeFalsy();
    expect(actualEmployee?.title).toBe(expectedEmployee.title);
    expectedEmployee.phone ?
      expect(actualEmployee?.phone).toBe(expectedEmployee.phone) :
      expect(actualEmployee?.phone).toBeFalsy();
    expectedEmployee.mail ?
      expect(actualEmployee?.mail).toBe(expectedEmployee.mail) :
      expect(actualEmployee?.mail).toBeFalsy();
    expectedEmployee.streetName ?
      expect(actualEmployee?.streetName).toBe(expectedEmployee.streetName) :
      expect(actualEmployee?.streetName).toBeFalsy();
    expectedEmployee.houseNumber ?
      expect(actualEmployee?.houseNumber).toBe(expectedEmployee.houseNumber) :
      expect(actualEmployee?.houseNumber).toBeFalsy();
    expectedEmployee.postalCode ?
      expect(actualEmployee?.postalCode).toBe(expectedEmployee.postalCode) :
      expect(actualEmployee?.postalCode).toBeFalsy();
    expectedEmployee.locality ?
      expect(actualEmployee?.locality).toBe(expectedEmployee.locality) :
      expect(actualEmployee?.locality).toBeFalsy();
    expectedEmployee.province ?
      expect(actualEmployee?.province).toBe(expectedEmployee.province) :
      expect(actualEmployee?.province).toBeFalsy();
    expectedEmployee.country ?
      expect(actualEmployee?.country).toBe(expectedEmployee.country) :
      expect(actualEmployee?.country).toBeFalsy();
  }
}
