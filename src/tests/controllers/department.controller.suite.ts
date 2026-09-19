import { describe, it, beforeEach, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { DepartmentController } from '../../controllers/department.controller.js';
import { checkDepartment, checkDepartments } from '../checkers.js';
import { createMockDepartmentService, testErrorHandler } from '../tests.helpers.js';
import {
  DEPARTMENTS_URI,
  DEPARTMENT_BY_ID_URI,
  TEST_DEPARTMENTS,
  TEST_1ST_DEPARTMENT,
  TEST_DEPARTMENT_CREATED,
  TEST_DEPARTMENT_UPDATED,
  TEST_DEPARTMENT_MINIMAL,
  TEST_DEPARTMENT_MAXIMAL,
  TEST_DEPARTMENT_ID_NOT_EXISTING,
} from '../tests.constants.js';

/**
 * Unit tests for the {@link DepartmentController}.
 * This test suite verifies that the {@link DepartmentController} functions correctly.
 * @param repositoryType the repository type
 */
export function departmentControllerTests(repositoryType: RepositoryType) {
  const mockDepartmentService = createMockDepartmentService();
  const departmentController = new DepartmentController(mockDepartmentService);

  /**
   * Clears the call history of every mocked method before each test, while keeping
   * the default resolved values (configured above) intact for the following test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests the retrieval of the initial department array.
   * This test checks if the controller can fetch an array of departments.
   */
  it('should get departments', async () => {
    // GIVEN
    const application = express();
    application.get(DEPARTMENTS_URI, departmentController.getDepartments);
    // WHEN
    const response = await request(application)
      .get(DEPARTMENTS_URI).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.OK);
    const actualDepartments = response.body as Department[];
    checkDepartments(TEST_DEPARTMENTS, actualDepartments);
    expect(mockDepartmentService.getDepartments).toHaveBeenCalledOnce();
    expect(mockDepartmentService.getDepartments).toHaveBeenCalledWith(repositoryType);
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
      .get(DEPARTMENTS_URI + TEST_1ST_DEPARTMENT.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.OK);
    const actualDepartment = response.body as Department;
    checkDepartment(TEST_1ST_DEPARTMENT, actualDepartment);
    expect(mockDepartmentService.getDepartment).toHaveBeenCalledOnce();
    expect(mockDepartmentService.getDepartment).toHaveBeenCalledWith(repositoryType, TEST_1ST_DEPARTMENT.id);
  });

  /**
   * Tests the creation of a new department.
   * This test checks if the controller can create a new department.
   */
  it('should create a department', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(DEPARTMENTS_URI, departmentController.createDepartment);
    const expectedDepartment = TEST_DEPARTMENT_CREATED;
    // WHEN
    const response = await request(application)
      .post(DEPARTMENTS_URI).query({ repositoryType: repositoryType }).send(expectedDepartment);
    // THEN
    expect(response.status).toBe(StatusCodes.CREATED);
    expect(mockDepartmentService.createDepartment).toHaveBeenCalledOnce();
    const [actualRepositoryType, actualDepartment] = vi.mocked(mockDepartmentService.createDepartment).mock.calls[0];
    expect(actualRepositoryType).toBe(repositoryType);
    checkDepartment(expectedDepartment, actualDepartment);
  });

  /**
   * Tests the update functionality of an existing department.
   * This test checks if the controller can update an existing department's details.
   */
  it('should update an existing department', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.patch(DEPARTMENT_BY_ID_URI, departmentController.updateDepartment);
    const expectedDepartment = TEST_DEPARTMENT_UPDATED;
    // WHEN
    const response = await request(application)
      .patch(DEPARTMENTS_URI + expectedDepartment.id).query({ repositoryType: repositoryType }).send(expectedDepartment);
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockDepartmentService.updateDepartment).toHaveBeenCalledOnce();
    const [actualRepositoryType, actualDepartment] = vi.mocked(mockDepartmentService.updateDepartment).mock.calls[0];
    expect(actualRepositoryType).toBe(repositoryType);
    checkDepartment(expectedDepartment, actualDepartment);
  });

  /**
   * Tests the deletion of a department.
   * This test checks if the controller can delete a department by its ID.
   */
  it('should delete a department', async () => {
    // GIVEN
    const application = express();
    application.delete(DEPARTMENT_BY_ID_URI, departmentController.deleteDepartment);
    const expectedDepartment = TEST_DEPARTMENT_CREATED;
    // WHEN
    const response = await request(application)
      .delete(DEPARTMENTS_URI + expectedDepartment.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockDepartmentService.deleteDepartment).toHaveBeenCalledOnce();
    expect(mockDepartmentService.deleteDepartment).toHaveBeenCalledWith(repositoryType, expectedDepartment.id);
  });

  /**
   * Tests the failed retrieval of a department by its ID.
   */
  it('should not get a department that does not exist', async () => {
    // GIVEN
    const application = express();
    application.get(DEPARTMENT_BY_ID_URI, departmentController.getDepartmentById);
    vi.mocked(mockDepartmentService.getDepartment).mockResolvedValueOnce(undefined);
    // WHEN
    const response = await request(application)
      .get(DEPARTMENTS_URI + TEST_DEPARTMENT_ID_NOT_EXISTING).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(mockDepartmentService.getDepartment).toHaveBeenCalledWith(repositoryType, TEST_DEPARTMENT_ID_NOT_EXISTING);
  });

  /**
   * Tests the failed deletion of a department by its ID.
   * The controller delegates the deletion to the service regardless of whether the department
   * actually exists; it is the service's responsibility to no-op silently in that case.
   */
  it('should not delete a department that does not exist', async () => {
    // GIVEN
    const application = express();
    application.delete(DEPARTMENT_BY_ID_URI, departmentController.deleteDepartment);
    // WHEN
    const response = await request(application)
      .delete(DEPARTMENTS_URI + TEST_DEPARTMENT_ID_NOT_EXISTING).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockDepartmentService.deleteDepartment).toHaveBeenCalledWith(repositoryType, TEST_DEPARTMENT_ID_NOT_EXISTING);
  });

  /**
   * Suite of tests for the minimal and maximal department data.
   */
  describe.for([
    ['only mandatory fields', TEST_DEPARTMENT_MINIMAL],
    ['maximal values in fields', TEST_DEPARTMENT_MAXIMAL]
  ])('tests for creation and retrieval with %s', ([info, testDepartment]) => {
    /**
     * Tests the creation and retrieval of a department.
     */
    it('should create and retrieve a department', async () => {
      // GIVEN
      const expectedDepartment = testDepartment as Department;
      const application = express();
      application.use(express.json());
      application.post(DEPARTMENTS_URI, departmentController.createDepartment);
      application.get(DEPARTMENT_BY_ID_URI, departmentController.getDepartmentById);
      vi.mocked(mockDepartmentService.getDepartment).mockResolvedValueOnce(expectedDepartment);
      // WHEN
      const createResponse = await request(application)
        .post(DEPARTMENTS_URI).query({ repositoryType: repositoryType }).send(expectedDepartment);
      const getResponse = await request(application)
        .get(DEPARTMENTS_URI + expectedDepartment.id).query({ repositoryType: repositoryType });
      // THEN
      expect(createResponse.status).toBe(StatusCodes.CREATED);
      const [, actualCreatedDepartment] = vi.mocked(mockDepartmentService.createDepartment).mock.calls[0];
      checkDepartment(expectedDepartment, actualCreatedDepartment);

      expect(getResponse.status).toBe(StatusCodes.OK);
      const actualRetrievedDepartment = getResponse.body as Department;
      checkDepartment(expectedDepartment, actualRetrievedDepartment);
    });
  });

  /**
   * Tests that an error thrown by the service is forwarded to the error handling middleware,
   * i.e. that the controller's try/catch blocks call `next(error)` correctly.
   */
  it('should forward the error to the error handling middleware when the service call fails', async () => {
    // GIVEN
    const application = express();
    application.get(DEPARTMENT_BY_ID_URI, departmentController.getDepartmentById);
    application.use(testErrorHandler);
    vi.mocked(mockDepartmentService.getDepartment).mockRejectedValueOnce(new Error('database is unavailable'));
    // WHEN
    const response = await request(application)
      .get(DEPARTMENTS_URI + TEST_1ST_DEPARTMENT.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
}
