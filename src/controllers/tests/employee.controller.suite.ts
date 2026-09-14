import { it, beforeEach, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { Employee } from "../../models/employee.js";
import { Title } from "../../models/title.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { EmployeeController } from '../employee.controller.js';
import { EmployeeService } from '../../services/employee.service.js';

import { INITIAL_DATA } from '../../services/services.constants.js';
import { checkEmployees, checkEmployee, testErrorHandler } from './checkers.js';

const EMPLOYEES_URI = '/employees/';
const EMPLOYEE_BY_ID_URI = '/employees/:id';

/**
 * Unit tests for the {@link EmployeeController}.
 * This test suite verifies that the {@link EmployeeController} functions correctly.
 * @param repositoryType the repository type
 */
export function employeeControllerTests(repositoryType: RepositoryType) {
  const TEST_EMPLOYEES = INITIAL_DATA.flatMap(dept => dept.employees);
  const TEST_EMPLOYEE = INITIAL_DATA[0].employees[0];
  const TEST_DEPARTMENT_ID = INITIAL_DATA[0].id;
  const NOT_EXISTING_EMPLOYEE_ID = Math.max(...TEST_EMPLOYEES.map(emp => emp.id)) + 1;

  const mockEmployeeService: EmployeeService = {
    createEmployee: vi.fn(),
    getEmployees: vi.fn().mockResolvedValue(TEST_EMPLOYEES),
    getEmployee: vi.fn().mockResolvedValue(TEST_EMPLOYEE),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
  } as any;
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
    checkEmployees(TEST_EMPLOYEE, response.body as Employee[]);
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
      .get(EMPLOYEES_URI + TEST_EMPLOYEE.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.OK);
    checkEmployee(TEST_EMPLOYEE, response.body as Employee);
    expect(mockEmployeeService.getEmployee).toHaveBeenCalledOnce();
    expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(repositoryType, TEST_EMPLOYEE.id);
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
    // WHEN
    const response = await request(application)
      .post(EMPLOYEES_URI).query({ repositoryType: repositoryType }).send(TEST_EMPLOYEE);
    // THEN
    expect(response.status).toBe(StatusCodes.CREATED);
    expect(mockEmployeeService.createEmployee).toHaveBeenCalledOnce();
    const [actualRepositoryType, actualEmployee] = vi.mocked(mockEmployeeService.createEmployee).mock.calls[0];
    expect(actualRepositoryType).toBe(repositoryType);
    checkEmployee(TEST_EMPLOYEE, actualEmployee);
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
    const expectedEmployee: Employee = {
      ...TEST_EMPLOYEE,
      firstName: 'Updated Employee First Name',
      lastName: 'Updated Employee Last Name',
    };
    // WHEN
    const response = await request(application)
      .patch(EMPLOYEES_URI + TEST_EMPLOYEE.id).query({ repositoryType: repositoryType }).send(expectedEmployee);
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
    // WHEN
    const response = await request(application)
      .delete(EMPLOYEES_URI + TEST_EMPLOYEE.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledOnce();
    expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(repositoryType, TEST_EMPLOYEE.id);
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
      .get(EMPLOYEES_URI + NOT_EXISTING_EMPLOYEE_ID).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(repositoryType, NOT_EXISTING_EMPLOYEE_ID);
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
      .delete(EMPLOYEES_URI + NOT_EXISTING_EMPLOYEE_ID).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.NO_CONTENT);
    expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(repositoryType, NOT_EXISTING_EMPLOYEE_ID);
  });

  /**
   * Tests the creation of an employee with only mandatory fields.
   */
  it('should create and retrieve an employee with only mandatory fields', async () => {
    // GIVEN
    const expectedEmployee: Employee = {
      id: 5432103,
      departmentId: TEST_DEPARTMENT_ID,
      firstName: 'FN',
      lastName: 'LN',
      title: Title.Analyst,
      phone: '+1 000-000-0000',
      mail: 'a@b.com',
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
    checkEmployee(expectedEmployee, actualCreatedEmployee);
    expect(getResponse.status).toBe(StatusCodes.OK);
    checkEmployee(expectedEmployee, getResponse.body as Employee);
  });

  /**
   * Tests the creation of an employee with maximal / edge-case values in fields.
   */
  it('should create and retrieve an employee with maximal / edge-case field values', async () => {
    // GIVEN
    const expectedEmployee: Employee = {
      id: 5432104,
      departmentId: TEST_DEPARTMENT_ID,
      firstName: 'FN-ab12-'.repeat(5),
      lastName: 'LN-ab12-'.repeat(5),
      title: Title.Developer,
      phone: '+00 (000) 000-00-00 ext.99999',
      mail: 'a'.repeat(35) + '@' + 'b'.repeat(40) + '.com',
      streetName: 'ST-ab12-'.repeat(10),
      houseNumber: '012345-ABC'.repeat(2),
      postalCode: '0-123-456-'.repeat(2),
      locality: 'City/With Special-Chars & Ünïcödé 12',
      province: 'Province/With Spec-Chars & Ünïcödé 1',
      country: 'Country/With Spec-Chars & Ünïcödé 12',
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
    checkEmployee(expectedEmployee, actualCreatedEmployee);
    expect(getResponse.status).toBe(StatusCodes.OK);
    checkEmployee(expectedEmployee, getResponse.body as Employee);
  });

  /**
   * Tests the creation of an employee for each possible title, verifying that the
   * title round-trips through the request body -> mapper -> service -> response correctly.
   */
  it.each(Object.values(Title))('should create and retrieve an employee with title[%s]', async (titleValue) => {
    // GIVEN
    const expectedEmployee: Employee = {
      id: 5432100 + Object.values(Title).indexOf(titleValue),
      departmentId: TEST_DEPARTMENT_ID,
      firstName: 'FN',
      lastName: 'LN',
      title: titleValue,
      phone: '+1 000-000-0000',
      mail: 'a@b.com',
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
    expect((getResponse.body as Employee).title).toBe(titleValue);
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
      .get(EMPLOYEES_URI + TEST_EMPLOYEE.id).query({ repositoryType: repositoryType });
    // THEN
    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
}
