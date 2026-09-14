import { it, beforeEach, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationController } from '../initialization.controller.js';
import { InitializationService } from '../../services/initialization.service.js';
import { INITIAL_DATA } from '../../services/services.constants.js';
import { testErrorHandler } from './checkers.js';

const LOAD_URI = '/load/';

/**
 * Unit tests for the {@link InitializationController}.
 * This test suite verifies that the {@link InitializationController} functions correctly.
 * @param repositoryType the repository type
 */
export function initializationControllerTests(repositoryType: RepositoryType) {
  const mockInitializationService: InitializationService = {
    loadInitialData: vi.fn(),
  } as any;
  const initializationController = new InitializationController(mockInitializationService);

  /**
   * Clears the call history of every mocked method before each test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests the initialization with departments explicitly provided in the request body.
   * The controller passes the request body through to the service unmodified (there is
   * no mapper involved), so the departments are compared after a JSON round-trip.
   */
  it('should load the initial data with the departments provided in the request body', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(LOAD_URI, initializationController.loadInitialData);
    const requestDepartments: Department[] = JSON.parse(JSON.stringify(INITIAL_DATA));
    // WHEN
    const response = await request(application)
      .post(LOAD_URI).query({ repositoryType: repositoryType }).send({ departments: requestDepartments });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockInitializationService.loadInitialData).toHaveBeenCalledOnce();
    expect(mockInitializationService.loadInitialData).toHaveBeenCalledWith(repositoryType, requestDepartments);
  });

  /**
   * Tests the initialization when no departments are provided in the request body.
   * The controller must fall back to an empty array (the service, not the controller,
   * is responsible for substituting its own default dataset).
   */
  it('should load an empty department array when none is provided in the request body', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(LOAD_URI, initializationController.loadInitialData);
    // WHEN
    const response = await request(application)
      .post(LOAD_URI).query({ repositoryType: repositoryType }).send({});
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockInitializationService.loadInitialData).toHaveBeenCalledOnce();
    expect(mockInitializationService.loadInitialData).toHaveBeenCalledWith(repositoryType, []);
  });

  /**
   * Tests the initialization when the request body itself is missing entirely.
   */
  it('should load an empty department array when the request body is missing', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(LOAD_URI, initializationController.loadInitialData);
    // WHEN
    const response = await request(application)
      .post(LOAD_URI).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockInitializationService.loadInitialData).toHaveBeenCalledOnce();
    expect(mockInitializationService.loadInitialData).toHaveBeenCalledWith(repositoryType, []);
  });

  /**
   * Tests that an error thrown by the service is forwarded to the error handling middleware,
   * i.e. that the controller's try/catch block calls `next(error)` correctly.
   */
  it('should forward the error to the error handling middleware when the service call fails', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(LOAD_URI, initializationController.loadInitialData);
    application.use(testErrorHandler);
    vi.mocked(mockInitializationService.loadInitialData).mockRejectedValueOnce(new Error('database is unavailable'));
    // WHEN
    const response = await request(application)
      .post(LOAD_URI).query({ repositoryType: repositoryType }).send({ departments: [] });
    // THEN
    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
}
