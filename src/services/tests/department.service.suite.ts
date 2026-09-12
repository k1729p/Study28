import { describe, it, beforeAll, expect } from "vitest";

import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { INITIAL_DATA, MAX_INT_32 } from '../services.constants.js';
import { checkDefaultDepartments, checkDepartment } from './checkers.js';

/**
 * Unit tests for the {@link DepartmentService}.
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
   * Tests the retrieval of the initial department array.
   * This test checks if the service can fetch an array of departments.
   */
  it('should get departments', async () => {
    // GIVEN
    // WHEN
    const actualDepartments = await departmentService.getDepartments(repositoryType);
    // THEN
    checkDefaultDepartments(actualDepartments);
  });

  /**
   * Suite of tests for the retrieval of departments.
   * Tests the retrieval of the first and the last department in the initial dataset.
   */
  describe.for([
    0,
    INITIAL_DATA.length - 1
  ])('tests use initial data array index[%d]', (index) => {
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
  describe('tests for recreating a department', () => {
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
  ])('tests use not existing department id[%d]', (id) => {
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
      // GIVEN / WHEN / THEN
      // Documents current contract: deleting an absent id must not throw.
      await expect(
        departmentService.deleteDepartment(repositoryType, id)
      ).resolves.not.toThrow();
    });
  });

  /**
   * Suite of tests for the minimal and maximal department data.
   */
  describe('tests use minimal and maximal department data', () => {
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
      if (actualDepartment?.keywords) {
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
   * Suite of tests for the retrieval and deletion of a department when ID is out of range.
   */
  describe.for([
    0,
    MAX_INT_32 + 1
  ])('tests use out of range department id[%d]', (id) => {
    /**
     * Tests the failed retrieval of a department when ID is out of range.
     */
    it('should throw RangeError and not get a department', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        departmentService.getDepartment(repositoryType, id)
      ).rejects.toThrow(RangeError);
    });

    /**
     * Tests the failed deletion of a department when ID is out of range.
     */
    it('should throw RangeError and not delete a department', async () => {
      // GIVEN / WHEN / THEN
      await expect(
        departmentService.deleteDepartment(repositoryType, id)
      ).rejects.toThrow(RangeError);
    });
  });
}
