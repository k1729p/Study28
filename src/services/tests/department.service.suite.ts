import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { INITIAL_DATA, MAX_INT_32 } from '../services.constants.js';
import { describe, beforeAll, it, expect, assert } from "vitest";

/**
 * Unit tests for the {@link DepartmentService}.
 *
 * This test suite verifies that the {@link DepartmentService} functions correctly.
 * @param repositoryType the repository type
 */
export function departmentServiceTests(repositoryType: RepositoryType) {
  const initializationService = new InitializationService();
  const departmentService = new DepartmentService();
  const TEST_DEPARTMENT = INITIAL_DATA[0];

  /**
   * Sets up the testing module for the DepartmentService.
   */
  beforeAll(async () => {
    await initializationService.loadInitialData(repositoryType, []);
  }, 90_000);

  /**
   * Suite of tests for the retrieval of departments.
   * Tests the retrieval of the first and the last department in the initial dataset.
   */
  describe.for([
    0,
    INITIAL_DATA.length - 1
  ])('retrieval tests use initial data array index[%d]', (index) => {
    /**
     * Tests the retrieval of the initial department array.
     * This test checks if the service can fetch an array of departments.
     */
    it('should get departments', async () => {
      // GIVEN
      const expectedDepartment = INITIAL_DATA[index];
      // WHEN
      const actualDepartments = await departmentService.getDepartments(repositoryType);
      // THEN
      checkDepartments(expectedDepartment, actualDepartments);
    });

    /**
     * Tests the retrieval of a department by its ID.
     * This test checks if the service can fetch a department by its ID.
     */
    it('should get a specific department by id', async () => {
      // GIVEN
      const expectedDepartment = INITIAL_DATA[index];
      // WHEN
      const actualDepartment = await departmentService.getDepartment(repositoryType, expectedDepartment.id);
      // THEN
      checkDepartment(expectedDepartment, actualDepartment);
    });
  });

  /**
   * Suite of tests for the recreation of a department.
   * Department's actions sequence: Update -> Delete -> Create
   */
  describe('should recreate a department', () => {
    /**
     * Tests the update functionality of an existing department.
     * This test checks if the service can update an existing department's details,
     * ensuring that the updated department has the new values.
     */
    it('should update an existing department', async () => {
      // GIVEN
      const expectedDepartment = {
        ...TEST_DEPARTMENT,
        name: 'Updated Department Name'
      };
      // WHEN
      await departmentService.updateDepartment(repositoryType, expectedDepartment);
      // THEN
      const actualDepartment = await departmentService.getDepartment(repositoryType, expectedDepartment.id);
      checkDepartment(expectedDepartment, actualDepartment);
    });

    /**
     * Tests the deletion of a department.
     * This test checks if the service can delete a department by its ID,
     * ensuring that the department is no longer present in the department array
     * and that all associated employees are also deleted.
     */
    it('should delete a department', async () => {
      // GIVEN
      // WHEN
      await departmentService.deleteDepartment(repositoryType, TEST_DEPARTMENT.id);
      // THEN
      const actualDepartment = await departmentService.getDepartment(repositoryType, TEST_DEPARTMENT.id);
      expect(actualDepartment).toBeUndefined();
    });

    /**
     * Tests the creation of a new department.
     * This test checks if the service can create a new department,
     * ensuring that the new department is added to the department array
     * and has a valid ID.
     */
    it('should create a department', async () => {
      // GIVEN
      const expectedDepartment = { ...TEST_DEPARTMENT, employees: [] };
      // WHEN
      await departmentService.createDepartment(repositoryType, expectedDepartment);
      // THEN
      const actualDepartment = await departmentService.getDepartment(repositoryType, expectedDepartment.id);
      checkDepartment(expectedDepartment, actualDepartment);
    });
  });

  /**
   * Suite of tests for the retrieval and deletion of a department that does not exist.
   */
  describe.for([
    Math.max(...INITIAL_DATA.map(dept => dept.id)) + 1
  ])('test uses not existing department id[%d]', (id) => {
    /**
     * Tests the failed retrieval of a department by its ID.
     */
    it('should not get a department that does not exist', async () => {
      // GIVEN
      // WHEN
      const actualDepartment = await departmentService.getDepartment(repositoryType, id);
      // THEN
      expect(actualDepartment).toBeUndefined();
    });

    /**
     * Tests the failed deletion of a department by its ID.
     */
    it('should not delete a department that does not exist', async () => {
      // GIVEN
      // WHEN / THEN
      // Documents current contract: deleting an absent id must not throw.
      await expect(
        departmentService.deleteDepartment(repositoryType, id)
      ).resolves.not.toThrow();
    });
  });

  /**
   * Suite of tests for the retrieval and deletion of a department when ID is out of range.
   */
  describe.for([
    0,
    MAX_INT_32 + 1
  ])('test uses out of range department id[%d]', (id) => {
    /**
     * Tests the failed retrieval of a department when ID is out of range.
     */
    it('should not get a department when id is out of range', async () => {
      // GIVEN
      // WHEN / THEN
      await expect(
        departmentService.getDepartment(repositoryType, id)
      ).rejects.toThrow(RangeError);
    });

    /**
     * Tests the failed deletion of a department when ID is out of range.
     */
    it('should not delete a department when id is out of range', async () => {
      // GIVEN
      // WHEN / THEN
      await expect(
        departmentService.deleteDepartment(repositoryType, id)
      ).rejects.toThrow(RangeError);
    });
  });

  /**
   * Suite of tests for the minimal and maximal department data.
   */
  describe('minimal and maximal department data', () => {
    /**
     * Tests the creation of a department with only mandatory fields.
     */
    it('should create and retrieve a department with only mandatory fields', async () => {
      // GIVEN
      const expectedDepartment: Department = {
        id: 5432101,
        name: 'D',
        employees: [],
      };
      // WHEN
      await departmentService.createDepartment(repositoryType, expectedDepartment);
      const actualDepartment = await departmentService.getDepartment(repositoryType, expectedDepartment.id);
      // THEN
      expect(actualDepartment).toBeDefined();
      expect(actualDepartment?.id).toBe(expectedDepartment.id);
      expect(actualDepartment?.name).toBe(expectedDepartment.name);
      expect(actualDepartment?.startDate).toBeFalsy();
      expect(actualDepartment?.endDate).toBeFalsy();
      expect(actualDepartment?.notes).toBeFalsy();
      if(actualDepartment?.keywords) {
        expect(actualDepartment?.keywords).toEqual([]);
      } else {
        expect(actualDepartment?.keywords).toBeFalsy();
      }
      expect(actualDepartment?.image).toBeFalsy();
      expect(actualDepartment?.employees).toEqual([]);
      // Cleanup
      await departmentService.deleteDepartment(repositoryType, expectedDepartment.id);
    });

    /**
     * Tests the creation of a department with maximal values in fields.
     */
    it('should create and retrieve a department with maximal values in fields', async () => {
      // GIVEN
      const expectedDepartment: Department = {
        id: 5432102,
        name: 'Ünïcödé Départment 部門 abcd-1234',
        employees: [],
        notes: 'Note line.\n'.repeat(200),
        keywords: Array.from({ length: 40 }, (_, i) => `keyword-${i}`),
        startDate: new Date('1970-01-01T00:00:00.000Z'),
        endDate: new Date('2999-12-31T23:59:59.000Z'),
        image: 'images/' + 'x'.repeat(200) + '.jpg',
      };
      // WHEN
      await departmentService.createDepartment(repositoryType, expectedDepartment);
      const actualDepartment = await departmentService.getDepartment(repositoryType, expectedDepartment.id);
      // THEN
      checkDepartment(expectedDepartment, actualDepartment);
      // Cleanup
      await departmentService.deleteDepartment(repositoryType, expectedDepartment.id);
    });
  });

  /**
   * Suite of tests for an unregistered repository strategy.
   */
  describe.for([
    'UnknownRepositoryType' as RepositoryType
  ])('should throw for an unimplemented repository type', (unknownRepositoryType) => {
    /**
     * Tests the failed creation of a department
     * with an unimplemented repository type.
     */
    it('createDepartment() should throw ReferenceError', async () => {
      await expect(
        departmentService.createDepartment(unknownRepositoryType, TEST_DEPARTMENT)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed retrieval of departments
     * with an unimplemented repository type.
     */
    it('getDepartments() should throw ReferenceError', async () => {
      await expect(
        departmentService.getDepartments(unknownRepositoryType)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed retrieval of a department by its ID
     * with an unimplemented repository type.
     */
    it('getDepartment() should throw ReferenceError', async () => {
      await expect(
        departmentService.getDepartment(unknownRepositoryType, TEST_DEPARTMENT.id)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed update of a department
     * with an unimplemented repository type.
     */
    it('updateDepartment() should throw ReferenceError', async () => {
      await expect(
        departmentService.updateDepartment(unknownRepositoryType, TEST_DEPARTMENT)
      ).rejects.toThrow(ReferenceError);
    });

    /**
     * Tests the failed deletion of a department by its ID
     * with an unimplemented repository type.
     */
    it('deleteDepartment() should throw ReferenceError', async () => {
      await expect(
        departmentService.deleteDepartment(unknownRepositoryType, TEST_DEPARTMENT.id)
      ).rejects.toThrow(ReferenceError);
    });
  });

  /**
   * Checks the actual departments.
   * Used for test assertions.
   * @param expectedDepartment the expected department
   * @param actualDepartments the actual departments
   * @returns void
   */
  function checkDepartments(expectedDepartment: Department, actualDepartments: Department[]) {
    assert.isArray(actualDepartments);
    expect(actualDepartments).toHaveLength(INITIAL_DATA.length);
    const actualDepartment = actualDepartments.find(dep => dep.id === expectedDepartment.id);
    checkDepartment(expectedDepartment, actualDepartment);
  }

  /**
   * Checks that the actual department matches the expected department.
   * Used for test assertions.
   * @param expectedDepartment the expected department
   * @param actualDepartment the actual department
   * @returns void
   */
  function checkDepartment(expectedDepartment: Department, actualDepartment: Department | undefined) {
    expect(actualDepartment).toBeDefined();
    expect(actualDepartment?.id).toBe(expectedDepartment.id);
    expect(actualDepartment?.name).toBe(expectedDepartment.name);

    const actualStartDate = new Date(actualDepartment?.startDate ?? Date.now());
    const expectedStartDate = new Date(expectedDepartment.startDate ?? Date.now());
    expect(actualStartDate.getTime()).toEqual(expectedStartDate.getTime());
    const actualEndDate = new Date(actualDepartment?.endDate ?? Date.now());
    const expectedEndDate = new Date(expectedDepartment.endDate ?? Date.now());
    expect(actualEndDate.getTime()).toEqual(expectedEndDate.getTime());

    expectedDepartment.notes ?
      expect(actualDepartment?.notes).toBe(expectedDepartment.notes) :
      expect(actualDepartment?.notes).toBeFalsy;
    if(expectedDepartment.keywords) {
      expect(actualDepartment?.keywords).toHaveLength(expectedDepartment.keywords.length);
    } else {
        expect(actualDepartment?.keywords).toBeFalsy();
    }
    expectedDepartment.image ?
      expect(actualDepartment?.image).toBe(expectedDepartment.image) :
      expect(actualDepartment?.image).toBeFalsy();
    expect(actualDepartment?.employees).toHaveLength(expectedDepartment.employees.length);
  }
}
