import { describe, it, beforeEach, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { RepositoryType } from '../../repositories/repository-type.js';
import { TransferController } from '../../controllers/transfer.controller.js';
import { createMockTransferService, testErrorHandler } from '../tests.helpers.js';
import {
  TRANSFERS_URI,
  TEST_1ST_DEPARTMENT,
  TEST_2ND_DEPARTMENT,
  TEST_1ST_EMPLOYEE,
  TEST_ALL_EMPLOYEE_IDS,
} from '../tests.constants.js';

/**
 * Unit tests for the {@link TransferController}.
 * This test suite verifies that the {@link TransferController} functions correctly.
 * @param repositoryType the repository type
 */
export function transferControllerTests(repositoryType: RepositoryType) {
  const mockTransferService = createMockTransferService();
  const transferController = new TransferController(mockTransferService);

  /**
   * Clears the call history of every mocked method before each test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Suite of tests for the employee transferring.
   */
  describe.for([
    ['a single employee', [TEST_1ST_EMPLOYEE.id]],
    ['all employees', TEST_ALL_EMPLOYEE_IDS]
  ])('tests for transferring %s', ([info, testEmployeeIds]) => {
    /**
     * Tests transferring employees from one department to another.
     */
    it('should transfer employees between departments', async () => {
      // GIVEN
      const application = express();
      application.use(express.json());
      application.post(TRANSFERS_URI, transferController.transferEmployees);
      const transferRequest = {
        sourceDepartmentId: TEST_1ST_DEPARTMENT.id,
        targetDepartmentId: TEST_2ND_DEPARTMENT.id,
        employeeIds: testEmployeeIds,
      };
      // WHEN
      const response = await request(application)
        .post(TRANSFERS_URI).query({ repositoryType: repositoryType }).send(transferRequest);
      // THEN
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(mockTransferService.transferEmployees).toHaveBeenCalledOnce();
      expect(mockTransferService.transferEmployees).toHaveBeenCalledWith(
        repositoryType, TEST_1ST_DEPARTMENT.id, TEST_2ND_DEPARTMENT.id, testEmployeeIds);
    });
  });

  /**
   * Suite of tests for request bodies that fail the controller's own input validation.
   */
  describe.for([
    ['with missing sourceDepartmentId',
      { targetDepartmentId: TEST_2ND_DEPARTMENT.id, employeeIds: TEST_ALL_EMPLOYEE_IDS }],
    ['with missing targetDepartmentId',
      { sourceDepartmentId: TEST_1ST_DEPARTMENT.id, employeeIds: TEST_ALL_EMPLOYEE_IDS }],
    ['with missing employeeIds',
      { sourceDepartmentId: TEST_1ST_DEPARTMENT.id, targetDepartmentId: TEST_2ND_DEPARTMENT.id }],
    ['when employeeIds is not an array',
      { sourceDepartmentId: TEST_1ST_DEPARTMENT.id, targetDepartmentId: TEST_2ND_DEPARTMENT.id, employeeIds: TEST_1ST_EMPLOYEE.id }],
    ['with empty employeeIds array',
      { sourceDepartmentId: TEST_1ST_DEPARTMENT.id, targetDepartmentId: TEST_2ND_DEPARTMENT.id, employeeIds: [] }],
  ])('tests for transferring %s', ([info, testRequestBody]) => {
    /**
     * Tests transferring employees from one department to another.
     */
    it('should return "Bad Request" error and not transfer employees between departments', async () => {
      // GIVEN
      const application = express();
      application.use(express.json());
      application.post(TRANSFERS_URI, transferController.transferEmployees);
      // WHEN
      const response = await request(application)
        .post(TRANSFERS_URI).query({ repositoryType: repositoryType }).send(testRequestBody);
      // THEN
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(mockTransferService.transferEmployees).not.toHaveBeenCalled();
    });
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
