import { it, beforeAll, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';

import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { DepartmentController } from '../department.controller.js';
import { DepartmentService } from '../../services/department.service.js';

import { INITIAL_DATA } from '../../services/services.constants.js';
import { checkDepartment } from './checkers.js';

/**
 * Unit tests for the {@link DepartmentController}.
 * This test suite verifies that the {@link DepartmentController} functions correctly.
 * @param repositoryType the repository type
 */
export function departmentControllerTests(repositoryType: RepositoryType) {
  const TEST_DEPARTMENTS = INITIAL_DATA;
  const TEST_DEPARTMENT = INITIAL_DATA[0];
  const mockDepartmentService: DepartmentService = {
    createDepartment: vi.fn(),
    getDepartments: vi.fn().mockResolvedValue(TEST_DEPARTMENTS),
    getDepartment: vi.fn().mockResolvedValue(TEST_DEPARTMENT),
    updateDepartment: vi.fn(),
    deleteDepartment: vi.fn(),
  } as any;
  const departmentController = new DepartmentController(mockDepartmentService);
  const DEPARTMENTS_URI = '/departments/';
  const DEPARTMENT_BY_ID_URI = '/departments/:id';

  /**
   * Sets up the testing module for the DepartmentController.
   */
  beforeAll(async () => {
  });

  /**
   * Tests the retrieval of the initial department array.
   * This test checks if the controller can fetch an array of departments.
   */
  it('should get departments', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  /**
   * Tests the retrieval of a department by its ID.
   * This test checks if the controller can fetch a department by its ID.
   */
  it('should get a specific department by id', async () => {
    // GIVEN
    const application = express();
    application.get(DEPARTMENT_BY_ID_URI, departmentController.getDepartmentById);
    // WHEN
    const response = await request(application)
      .get(DEPARTMENTS_URI + TEST_DEPARTMENT.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(200);
    const actualDepartment = response.body as Department;
    checkDepartment(TEST_DEPARTMENT, actualDepartment);
    expect(mockDepartmentService.getDepartment).toHaveBeenCalledOnce();
    expect(mockDepartmentService.getDepartment).toHaveBeenCalledWith(repositoryType, TEST_DEPARTMENT.id);
  });

  /**
   * Tests the creation of a new department.
   * This test checks if the controller can create a new department,
   * ensuring that the new department is added to the department array
   * and has a valid ID.
   */
  it('should create a department', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  /**
   * Tests the update functionality of an existing department.
   * This test checks if the controller can update an existing department's details,
   * ensuring that the updated department has the new values.
   */
  it('should update an existing department', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  /**
   * Tests the deletion of a department.
   * This test checks if the controller can delete a department by its ID,
   * ensuring that the department is no longer present in the department array
   * and that all associated employees are also deleted.
   */
  it('should delete a department', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  /**
   * Tests the failed retrieval of a department by its ID.
   */
  it('should not get a department that does not exist', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  /**
   * Tests the failed deletion of a department by its ID.
   */
  it('should not delete a department that does not exist', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

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
    // THEN
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
    // THEN
  });
}
