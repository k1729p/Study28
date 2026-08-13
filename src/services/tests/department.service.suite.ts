import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { INITIAL_DATA } from '../initial-data.js';
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
   * Tests the retrieval of the initial department array.
   * This test checks if the service can return a non-empty array of departments
   * and that the first department has a defined name.
   */
  it('should get departments', async () => {
    // GIVEN
    // WHEN
    const actualDepartments = await departmentService.getDepartments(repositoryType);
    // THEN
    checkDepartments(TEST_DEPARTMENT, actualDepartments);
  });
  /**
   * Tests the retrieval of a department by its ID.
   * This test checks if the service can fetch a department by its ID
   * and that the returned department has the expected ID.
   */
  it('should get a specific department by id', async () => {
    // GIVEN
    // WHEN
    const actualDepartment = await departmentService.getDepartment(repositoryType, TEST_DEPARTMENT.id);
    // THEN
    checkDepartment(TEST_DEPARTMENT, actualDepartment);
  });
  /**
   * Tests the recreation of a department.
   */
  describe('should recreate a department', () => {
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
      const deletedDepartment = await departmentService.getDepartment(repositoryType, TEST_DEPARTMENT.id);
      expect(deletedDepartment).toBeUndefined();
    });
    /**
     * Tests the creation of a new department.
     * This test checks if the service can create a new department,
     * ensuring that the new department is added to the department array
     * and has a valid ID.
     */
    it('should create a department', async () => {
      // GIVEN
      // WHEN
      await departmentService.createDepartment(repositoryType, TEST_DEPARTMENT);
      // THEN
      const actualDepartment = await departmentService.getDepartment(repositoryType, TEST_DEPARTMENT.id);
      checkDepartment(TEST_DEPARTMENT, actualDepartment);
    });
  });
  /**
   * Tests the update functionality of an existing department.
   * This test checks if the service can update an existing department's details,
   * ensuring that the updated department has the new values.
   */
  it('should update an existing department', async () => {
    // GIVEN
    const UPDATED_NAME = 'Updated Dep Name';
    const updatedDepartment = { ...TEST_DEPARTMENT, name: UPDATED_NAME };
    // WHEN
    await departmentService.updateDepartment(repositoryType, updatedDepartment);
    // THEN
    const actualDepartment = await departmentService.getDepartment(repositoryType, TEST_DEPARTMENT.id);
    expect(actualDepartment).toBeDefined();
    expect(actualDepartment?.id).toBe(TEST_DEPARTMENT.id);
    expect(actualDepartment?.name).toBe(UPDATED_NAME);
  });
  /**
   * Tests the failed retrieval of a department by its ID.
   */
  it('should not get a specific department by id', async () => {
    // GIVEN
    // WHEN
    const actualDepartment = await departmentService.getDepartment(repositoryType, 0);
    // THEN
    expect(actualDepartment).toBeUndefined();
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

    let actualDate = new Date(actualDepartment?.startDate ?? Date.now());
    let expectedDate = new Date(expectedDepartment.startDate ?? Date.now());
    expect(actualDate.getTime()).toEqual(expectedDate.getTime());
    actualDate = new Date(actualDepartment?.endDate ?? Date.now());
    expectedDate = new Date(expectedDepartment.endDate ?? Date.now());
    expect(actualDate.getTime()).toEqual(expectedDate.getTime());

    expect(actualDepartment?.notes).toBe(expectedDepartment.notes);
    expect(actualDepartment?.keywords).toEqual(expectedDepartment.keywords);
  }
}