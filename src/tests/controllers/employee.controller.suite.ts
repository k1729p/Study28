import { describe, it, beforeEach, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { Employee } from "../../models/employee.js";
import { Title } from "../../models/title.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { EmployeeController } from '../../controllers/employee.controller.js';

import { checkEmployee, checkEmployees } from '../checkers.js';
import { createMockEmployeeService, testErrorHandler } from '../tests.helpers.js';
import {
  EMPLOYEES_URI,
  EMPLOYEE_BY_ID_URI,
  TEST_1ST_EMPLOYEE,
  TEST_EMPLOYEE_CREATED,
  TEST_EMPLOYEE_UPDATED,
  TEST_EMPLOYEE_MINIMAL,
  TEST_EMPLOYEE_MAXIMAL,
  TEST_EMPLOYEE_ID_NOT_EXISTING
} from '../tests.constants.js';

/**
 * Unit tests for the {@link EmployeeController}.
 * This test suite verifies that the {@link EmployeeController} functions correctly.
 * @param repositoryType the repository type
 */
export function employeeControllerTests(repositoryType: RepositoryType) {
  const mockEmployeeService = createMockEmployeeService();
  const employeeController = new EmployeeController(mockEmployeeService);

  /**
   * Clears the call history of every mocked method before each test, while keeping
   * the default resolved values (configured above) intact for the following test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests the retrieval of the initial employee array.
   * This test checks if the controller can fetch an array of employees.
   */
  it('should get employees', async () => {
    // GIVEN
    const application = express();
    application.get(EMPLOYEES_URI, employeeController.getEmployees);
    // WHEN
    const response = await request(application)
      .get(EMPLOYEES_URI).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.OK);
    const actualEmployees = response.body as Employee[];
    checkEmployees(TEST_1ST_EMPLOYEE, actualEmployees);
    expect(mockEmployeeService.getEmployees).toHaveBeenCalledOnce();
    expect(mockEmployeeService.getEmployees).toHaveBeenCalledWith(repositoryType);
  });

  /**
   * Tests the retrieval of an employee by its ID.
   * This test checks if the controller can fetch an employee by its ID.
   */
  it('should get a specific employee by id', async () => {
    // GIVEN
    const application = express();
    application.get(EMPLOYEE_BY_ID_URI, employeeController.getEmployeeById);
    // WHEN
    const response = await request(application)
      .get(EMPLOYEES_URI + TEST_1ST_EMPLOYEE.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.OK);
    const actualEmployee = response.body as Employee;
    checkEmployee(TEST_1ST_EMPLOYEE, actualEmployee);
    expect(mockEmployeeService.getEmployee).toHaveBeenCalledOnce();
    expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(repositoryType, TEST_1ST_EMPLOYEE.id);
  });

  /**
   * Tests the creation of a new employee.
   * This test checks if the controller can create a new employee.
   */
  it('should create an employee', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.post(EMPLOYEES_URI, employeeController.createEmployee);
    const expectedEmployee = TEST_EMPLOYEE_CREATED;
    // WHEN
    const response = await request(application)
      .post(EMPLOYEES_URI).query({ repositoryType: repositoryType }).send(expectedEmployee);
    // THEN
    expect(response.status).toBe(StatusCodes.CREATED);
    expect(mockEmployeeService.createEmployee).toHaveBeenCalledOnce();
    const [actualRepositoryType, actualEmployee] = vi.mocked(mockEmployeeService.createEmployee).mock.calls[0];
    expect(actualRepositoryType).toBe(repositoryType);
    checkEmployee(expectedEmployee, actualEmployee);
  });

  /**
   * Tests the update functionality of an existing employee.
   * This test checks if the controller can update an existing employee's details.
   */
  it('should update an existing employee', async () => {
    // GIVEN
    const application = express();
    application.use(express.json());
    application.patch(EMPLOYEE_BY_ID_URI, employeeController.updateEmployee);
    const expectedEmployee = TEST_EMPLOYEE_UPDATED;
    // WHEN
    const response = await request(application)
      .patch(EMPLOYEES_URI + TEST_EMPLOYEE_UPDATED.id).query({ repositoryType: repositoryType }).send(expectedEmployee);
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockEmployeeService.updateEmployee).toHaveBeenCalledOnce();
    const [actualRepositoryType, actualEmployee] = vi.mocked(mockEmployeeService.updateEmployee).mock.calls[0];
    expect(actualRepositoryType).toBe(repositoryType);
    checkEmployee(expectedEmployee, actualEmployee);
  });

  /**
   * Tests the deletion of an employee.
   * This test checks if the controller can delete an employee by its ID.
   */
  it('should delete an employee', async () => {
    // GIVEN
    const application = express();
    application.delete(EMPLOYEE_BY_ID_URI, employeeController.deleteEmployee);
    const expectedEmployee = TEST_EMPLOYEE_CREATED;
    // WHEN
    const response = await request(application)
      .delete(EMPLOYEES_URI + expectedEmployee.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledOnce();
    expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(repositoryType, expectedEmployee.id);
  });

  /**
   * Tests the failed retrieval of an employee by its ID.
   */
  it('should not get an employee that does not exist', async () => {
    // GIVEN
    const application = express();
    application.get(EMPLOYEE_BY_ID_URI, employeeController.getEmployeeById);
    vi.mocked(mockEmployeeService.getEmployee).mockResolvedValueOnce(undefined);
    // WHEN
    const response = await request(application)
      .get(EMPLOYEES_URI + TEST_EMPLOYEE_ID_NOT_EXISTING).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(repositoryType, TEST_EMPLOYEE_ID_NOT_EXISTING);
  });

  /**
   * Tests the failed deletion of an employee by its ID.
   * The controller delegates the deletion to the service regardless of whether the employee
   * actually exists; it is the service's responsibility to no-op silently in that case.
   */
  it('should not delete an employee that does not exist', async () => {
    // GIVEN
    const application = express();
    application.delete(EMPLOYEE_BY_ID_URI, employeeController.deleteEmployee);
    // WHEN
    const response = await request(application)
      .delete(EMPLOYEES_URI + TEST_EMPLOYEE_ID_NOT_EXISTING).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(repositoryType, TEST_EMPLOYEE_ID_NOT_EXISTING);
  });

  /**
   * Suite of tests for the minimal and maximal employee data.
   */
  describe.for([
    ['only mandatory fields', TEST_EMPLOYEE_MINIMAL],
    ['maximal values in fields', TEST_EMPLOYEE_MAXIMAL]
  ])('tests for creation and retrieval with %s', ([info, testEmployee]) => {
    /**
     * Tests the creation and retrieval of an employee.
     */
    it('should create and retrieve an employee', async () => {
      // GIVEN
      const expectedEmployee = testEmployee as Employee;
      const application = express();
      application.use(express.json());
      application.post(EMPLOYEES_URI, employeeController.createEmployee);
      application.get(EMPLOYEE_BY_ID_URI, employeeController.getEmployeeById);
      vi.mocked(mockEmployeeService.getEmployee).mockResolvedValueOnce(expectedEmployee);
      // WHEN
      const createResponse = await request(application)
        .post(EMPLOYEES_URI).query({ repositoryType: repositoryType }).send(expectedEmployee);
      const getResponse = await request(application)
        .get(EMPLOYEES_URI + expectedEmployee.id).query({ repositoryType: repositoryType });
      // THEN
      expect(createResponse.status).toBe(StatusCodes.CREATED);
      const [, actualCreatedEmployee] = vi.mocked(mockEmployeeService.createEmployee).mock.calls[0];
      checkEmployee(expectedEmployee, actualCreatedEmployee);

      expect(getResponse.status).toBe(StatusCodes.OK);
      const actualRetrievedEmployee = getResponse.body as Employee;
      checkEmployee(expectedEmployee, actualRetrievedEmployee);
    });
  });

  /**
   * Tests the creation of an employee for each possible title, verifying that the
   * title round-trips through the request body -> mapper -> service -> response correctly.
   */
  it.each(Object.values(Title))('should create and retrieve an employee with title[%s]', async (titleValue) => {
    // GIVEN
    const expectedEmployee: Employee = {
      ...TEST_EMPLOYEE_CREATED,
      title: titleValue
    };
    const application = express();
    application.use(express.json());
    application.post(EMPLOYEES_URI, employeeController.createEmployee);
    application.get(EMPLOYEE_BY_ID_URI, employeeController.getEmployeeById);
    vi.mocked(mockEmployeeService.getEmployee).mockResolvedValueOnce(expectedEmployee);
    // WHEN
    const createResponse = await request(application)
      .post(EMPLOYEES_URI).query({ repositoryType: repositoryType }).send(expectedEmployee);
    const getResponse = await request(application)
      .get(EMPLOYEES_URI + expectedEmployee.id).query({ repositoryType: repositoryType });
    // THEN
    expect(createResponse.status).toBe(StatusCodes.CREATED);
    const [, actualCreatedEmployee] = vi.mocked(mockEmployeeService.createEmployee).mock.calls[0];
    expect(actualCreatedEmployee.title).toBe(titleValue);

    expect(getResponse.status).toBe(StatusCodes.OK);
    const actualRetrievedEmployee = getResponse.body as Employee;
    expect(actualRetrievedEmployee.title).toBe(titleValue);
  });

  /**
   * Tests that an error thrown by the service is forwarded to the error handling middleware,
   * i.e. that the controller's try/catch blocks call `next(error)` correctly.
   */
  it('should forward the error to the error handling middleware when the service call fails', async () => {
    // GIVEN
    const application = express();
    application.get(EMPLOYEE_BY_ID_URI, employeeController.getEmployeeById);
    application.use(testErrorHandler);
    vi.mocked(mockEmployeeService.getEmployee).mockRejectedValueOnce(new Error('database is unavailable'));
    // WHEN
    const response = await request(application)
      .get(EMPLOYEES_URI + TEST_1ST_EMPLOYEE.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
}
