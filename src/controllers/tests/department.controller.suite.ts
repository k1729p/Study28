import { it, beforeAll, beforeEach, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { DepartmentController } from '../department.controller.js';
import { DepartmentService } from '../../services/department.service.js';

import { INITIAL_DATA } from '../../services/services.constants.js';
import { checkDepartment, checkDepartments, testErrorHandler } from './checkers.js';

/**
 * Unit tests for the {@link DepartmentController}.
 * This test suite verifies that the {@link DepartmentController} functions correctly.
 * @param repositoryType the repository type
 */
export function departmentControllerTests(repositoryType: RepositoryType) {
  const TEST_DEPARTMENTS = INITIAL_DATA;
  const TEST_DEPARTMENT = INITIAL_DATA[0];
  const NOT_EXISTING_DEPARTMENT_ID = Math.max(...INITIAL_DATA.map(dept => dept.id)) + 1;
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
      .get(DEPARTMENTS_URI + TEST_DEPARTMENT.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.OK);
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
    const application = express();
    application.use(express.json());
    application.post(DEPARTMENTS_URI, departmentController.createDepartment);
    // WHEN
    const response = await request(application)
      .post(DEPARTMENTS_URI).query({ repositoryType: repositoryType }).send(TEST_DEPARTMENT);
    // THEN
    expect(response.status).toBe(StatusCodes.CREATED);
    expect(mockDepartmentService.createDepartment).toHaveBeenCalledOnce();
    const [actualRepositoryType, actualDepartment] = vi.mocked(mockDepartmentService.createDepartment).mock.calls[0];
    expect(actualRepositoryType).toBe(repositoryType);
    checkDepartment(TEST_DEPARTMENT, actualDepartment);
  });

  /**
   * Tests the update functionality of an existing department.
   * This test checks if the controller can update an existing department's details,
   * ensuring that the updated department has the new values.
   */
  it('should update an existing department', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.patch(DEPARTMENT_BY_ID_URI, departmentController.updateDepartment);
    const expectedDepartment: Department = { ...TEST_DEPARTMENT, name: 'Updated Department Name' };
    // WHEN
    const response = await request(application)
      .patch(DEPARTMENTS_URI + TEST_DEPARTMENT.id).query({ repositoryType: repositoryType }).send(expectedDepartment);
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockDepartmentService.updateDepartment).toHaveBeenCalledOnce();
    const [actualRepositoryType, actualDepartment] = vi.mocked(mockDepartmentService.updateDepartment).mock.calls[0];
    expect(actualRepositoryType).toBe(repositoryType);
    checkDepartment(expectedDepartment, actualDepartment);
  });

  /**
   * Tests the deletion of a department.
   * This test checks if the controller can delete a department by its ID,
   * ensuring that the department is no longer present in the department array
   * and that all associated employees are also deleted.
   */
  it('should delete a department', async () => {
    // GIVEN
    const application = express();
    application.delete(DEPARTMENT_BY_ID_URI, departmentController.deleteDepartment);
    // WHEN
    const response = await request(application)
      .delete(DEPARTMENTS_URI + TEST_DEPARTMENT.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockDepartmentService.deleteDepartment).toHaveBeenCalledOnce();
    expect(mockDepartmentService.deleteDepartment).toHaveBeenCalledWith(repositoryType, TEST_DEPARTMENT.id);
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
      .get(DEPARTMENTS_URI + NOT_EXISTING_DEPARTMENT_ID).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(mockDepartmentService.getDepartment).toHaveBeenCalledWith(repositoryType, NOT_EXISTING_DEPARTMENT_ID);
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
      .delete(DEPARTMENTS_URI + NOT_EXISTING_DEPARTMENT_ID).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockDepartmentService.deleteDepartment).toHaveBeenCalledWith(repositoryType, NOT_EXISTING_DEPARTMENT_ID);
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
    checkDepartment(expectedDepartment, getResponse.body as Department);
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
    checkDepartment(expectedDepartment, getResponse.body as Department);
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
      .get(DEPARTMENTS_URI + TEST_DEPARTMENT.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
}
