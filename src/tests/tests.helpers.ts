import { vi } from "vitest";
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { InitializationService } from '../services/initialization.service.js';
import { DepartmentService } from '../services/department.service.js';
import { EmployeeService } from '../services/employee.service.js';
import { TransferService } from '../services/transfer.service.js';
import * as colors from "../utils/colors.js";
import {
  TEST_DEPARTMENTS,
  TEST_1ST_DEPARTMENT,
  TEST_EMPLOYEES,
  TEST_1ST_EMPLOYEE
} from './tests.constants.js';

/**
 * Gets the suite name in cyan.
 * @param label the label for test suite
 * @returns the suite label
 */
export const getSuiteNameInCyan = (label: string): string => {
  return `${colors.CYAN_BRIGHT} Repository type █ ${label} █ ${colors.RESET}`;
}
//(, (repositoryType) => {
/**
 * Gets the suite name in yellow.
 * @param label the label for test suite
 * @returns the suite label
 */
export const getSuiteNameInYellow = (label: string): string => {
  return `${colors.YELLOW_BRIGHT} ${label} tests ${colors.RESET}`;
}

/**
 * A minimal replica of the application's global error-handling middleware (see server.ts).
 * Registered, in controller tests, after the route(s) under test so that an error thrown by a
 * mocked service - and forwarded via `next(error)` from within the controller - results in the
 * same response the real Express application would produce.
 * @param err the error object
 * @param req the request object
 * @param res the response object
 * @param next the next middleware function
 */
export function testErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json('Internal Server Error');
}

/**
 * Creates the initialization service mock.
 * @returns the initialization service mock
 */
export const createMockInitializationService = (): InitializationService => {
  const mockInitializationService: InitializationService = {
    loadInitialData: vi.fn(),
  } as any;
  return mockInitializationService;
}
/**
 * Creates the department service mock.
 * @returns the department service mock
 */
export const createMockDepartmentService = (): DepartmentService => {
  const mockDepartmentService: DepartmentService = {
    createDepartment: vi.fn(),
    getDepartments: vi.fn().mockResolvedValue(TEST_DEPARTMENTS),
    getDepartment: vi.fn().mockResolvedValue(TEST_1ST_DEPARTMENT),
    updateDepartment: vi.fn(),
    deleteDepartment: vi.fn(),
  } as any;
  return mockDepartmentService;
}

/**
 * Creates the employee service mock.
 * @returns the employee service mock
 */
export const createMockEmployeeService = (): EmployeeService => {
  const mockEmployeeService: EmployeeService = {
    createEmployee: vi.fn(),
    getEmployees: vi.fn().mockResolvedValue(TEST_EMPLOYEES),
    getEmployee: vi.fn().mockResolvedValue(TEST_1ST_EMPLOYEE),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
  } as any;
  return mockEmployeeService;
}

/**
 * Creates the transfer service mock.
 * @returns the transfer service mock
 */
export const createMockTransferService = (): TransferService => {
  const mockTransferService: TransferService = {
    transferEmployees: vi.fn(),
  } as any;
  return mockTransferService;
}

