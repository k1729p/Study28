import { it, beforeEach, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { RepositoryType } from '../../repositories/repository-type.js';
import { TransferController } from '../transfer.controller.js';
import { TransferService } from '../../services/transfer.service.js';
import { INITIAL_DATA } from '../../services/services.constants.js';
import { testErrorHandler } from './checkers.js';

const TRANSFERS_URI = '/transfers/';

/**
 * Unit tests for the {@link TransferController}.
 * This test suite verifies that the {@link TransferController} functions correctly.
 * @param repositoryType the repository type
 */
export function transferControllerTests(repositoryType: RepositoryType) {
  const mockTransferService: TransferService = {
    transferEmployees: vi.fn(),
  } as any;
  const transferController = new TransferController(mockTransferService);

  const TEST_1ST_DEPARTMENT = INITIAL_DATA[0];
  const TEST_2ND_DEPARTMENT = INITIAL_DATA[1];
  const TEST_ALL_EMPLOYEE_IDS = TEST_1ST_DEPARTMENT.employees.map(emp => emp.id);
  const TEST_1ST_EMPLOYEE_ID = TEST_1ST_DEPARTMENT.employees[0].id;

  /**
   * Clears the call history of every mocked method before each test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests transferring all employees from one department to another.
   */
  it('should transfer employees between departments', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(TRANSFERS_URI, transferController.transferEmployees);
    const transferRequest = {
      sourceDepartmentId: TEST_1ST_DEPARTMENT.id,
      targetDepartmentId: TEST_2ND_DEPARTMENT.id,
      employeeIds: TEST_ALL_EMPLOYEE_IDS,
    };
    // WHEN
    const response = await request(application)
      .post(TRANSFERS_URI).query({ repositoryType: repositoryType }).send(transferRequest);
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockTransferService.transferEmployees).toHaveBeenCalledOnce();
    expect(mockTransferService.transferEmployees).toHaveBeenCalledWith(
      repositoryType, TEST_1ST_DEPARTMENT.id, TEST_2ND_DEPARTMENT.id, TEST_ALL_EMPLOYEE_IDS);
  });

  /**
   * Tests transferring a single employee from one department to another.
   */
  it('should transfer a single employee between departments', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(TRANSFERS_URI, transferController.transferEmployees);
    const transferRequest = {
      sourceDepartmentId: TEST_1ST_DEPARTMENT.id,
      targetDepartmentId: TEST_2ND_DEPARTMENT.id,
      employeeIds: [TEST_1ST_EMPLOYEE_ID],
    };
    // WHEN
    const response = await request(application)
      .post(TRANSFERS_URI).query({ repositoryType: repositoryType }).send(transferRequest);
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockTransferService.transferEmployees).toHaveBeenCalledWith(
      repositoryType, TEST_1ST_DEPARTMENT.id, TEST_2ND_DEPARTMENT.id, [TEST_1ST_EMPLOYEE_ID]);
  });

  /**
   * Suite of tests for request bodies that fail the controller's own input validation,
   * i.e. requests that must never reach the service layer.
   */
  it.each([
    ['missing sourceDepartmentId',
      { targetDepartmentId: TEST_2ND_DEPARTMENT.id, employeeIds: TEST_ALL_EMPLOYEE_IDS }],
    ['missing targetDepartmentId',
      { sourceDepartmentId: TEST_1ST_DEPARTMENT.id, employeeIds: TEST_ALL_EMPLOYEE_IDS }],
    ['missing employeeIds',
      { sourceDepartmentId: TEST_1ST_DEPARTMENT.id, targetDepartmentId: TEST_2ND_DEPARTMENT.id }],
    ['employeeIds is not an array',
      { sourceDepartmentId: TEST_1ST_DEPARTMENT.id, targetDepartmentId: TEST_2ND_DEPARTMENT.id, employeeIds: TEST_1ST_EMPLOYEE_ID }],
    ['empty employeeIds array',
      { sourceDepartmentId: TEST_1ST_DEPARTMENT.id, targetDepartmentId: TEST_2ND_DEPARTMENT.id, employeeIds: [] }],
  ])('should return 400 and not call the service for invalid transfer data - %s', async (info, invalidBody) => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(TRANSFERS_URI, transferController.transferEmployees);
    // WHEN
    const response = await request(application)
      .post(TRANSFERS_URI).query({ repositoryType: repositoryType }).send(invalidBody);
    // THEN
    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(mockTransferService.transferEmployees).not.toHaveBeenCalled();
  });

  /**
   * Tests that, when no repositoryType query parameter is provided, the controller
   * falls back to RepositoryType.PostgreSQL.
   */
  it('should default to PostgreSQL when no repository type is provided', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(TRANSFERS_URI, transferController.transferEmployees);
    const transferRequest = {
      sourceDepartmentId: TEST_1ST_DEPARTMENT.id,
      targetDepartmentId: TEST_2ND_DEPARTMENT.id,
      employeeIds: TEST_ALL_EMPLOYEE_IDS,
    };
    // WHEN
    const response = await request(application)
      .post(TRANSFERS_URI).send(transferRequest);
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockTransferService.transferEmployees).toHaveBeenCalledWith(
      RepositoryType.PostgreSQL, TEST_1ST_DEPARTMENT.id, TEST_2ND_DEPARTMENT.id, TEST_ALL_EMPLOYEE_IDS);
  });

  /**
   * Tests that an error thrown by the service is forwarded to the error handling middleware,
   * i.e. that the controller's try/catch block calls `next(error)` correctly.
   */
  it('should forward the error to the error handling middleware when the service call fails', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(TRANSFERS_URI, transferController.transferEmployees);
    application.use(testErrorHandler);
    vi.mocked(mockTransferService.transferEmployees).mockRejectedValueOnce(new Error('database is unavailable'));
    const transferRequest = {
      sourceDepartmentId: TEST_1ST_DEPARTMENT.id,
      targetDepartmentId: TEST_2ND_DEPARTMENT.id,
      employeeIds: TEST_ALL_EMPLOYEE_IDS,
    };
    // WHEN
    const response = await request(application)
      .post(TRANSFERS_URI).query({ repositoryType: repositoryType }).send(transferRequest);
    // THEN
    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
}
