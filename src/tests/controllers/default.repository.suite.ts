import { describe, it, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationController } from '../../controllers/initialization.controller.js';
import { DepartmentController } from '../../controllers/department.controller.js';
import { EmployeeController } from '../../controllers/employee.controller.js';
import { TransferController } from '../../controllers/transfer.controller.js';
import { bodyToDepartments } from "../../controllers/controller-mappers.js";
import {
  checkDepartment, checkDepartments,
  checkEmployee, checkEmployees
} from '../checkers.js';
import {
  createMockInitializationService,
  createMockDepartmentService,
  createMockEmployeeService,
  createMockTransferService,
  getSuiteNameInYellow
} from '../tests.helpers.js';
import {
  LOAD_URI,
  DEPARTMENTS_URI,
  DEPARTMENT_BY_ID_URI,
  EMPLOYEES_URI,
  EMPLOYEE_BY_ID_URI,
  TRANSFERS_URI,
  TEST_DEPARTMENTS,
  TEST_1ST_DEPARTMENT,
  TEST_DEPARTMENT_CREATED,
  TEST_DEPARTMENT_UPDATED,
  TEST_1ST_EMPLOYEE,
  TEST_EMPLOYEE_CREATED,
  TEST_EMPLOYEE_UPDATED,
  TEST_2ND_DEPARTMENT,
  TEST_ALL_EMPLOYEE_IDS,
} from '../tests.constants.js';

/**
 * Unit tests for the default repository type
 */
export function controllerTestsWithDefaultRepository() {
  /**
   * Suite of tests with default repository for initialization controller.
   */
  describe(getSuiteNameInYellow('Initialization Controller'), () => {
    const mockInitializationService = createMockInitializationService();
    const initializationController = new InitializationController(mockInitializationService);
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
      const requestDepartments: Department[] = bodyToDepartments(TEST_DEPARTMENTS);
      // WHEN
      const response = await request(application)
        .post(LOAD_URI).send({ departments: requestDepartments });
      // THEN
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(mockInitializationService.loadInitialData).toHaveBeenCalledOnce();
      expect(mockInitializationService.loadInitialData).toHaveBeenCalledWith(RepositoryType.PostgreSQL, requestDepartments);
    });
  });
  /**
   * Suite of tests with default repository for department controller.
   */
  describe(getSuiteNameInYellow('Department Controller'), () => {
    const mockDepartmentService = createMockDepartmentService();
    const departmentController = new DepartmentController(mockDepartmentService);
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
        .get(DEPARTMENTS_URI);
      // THEN
      expect(response.status).toBe(StatusCodes.OK);
      const actualDepartments = response.body as Department[];
      checkDepartments(TEST_DEPARTMENTS, actualDepartments);
      expect(mockDepartmentService.getDepartments).toHaveBeenCalledOnce();
      expect(mockDepartmentService.getDepartments).toHaveBeenCalledWith(RepositoryType.PostgreSQL);
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
        .get(DEPARTMENTS_URI + TEST_1ST_DEPARTMENT.id);
      // THEN
      expect(response.status).toBe(StatusCodes.OK);
      const actualDepartment = response.body as Department;
      checkDepartment(TEST_1ST_DEPARTMENT, actualDepartment);
      expect(mockDepartmentService.getDepartment).toHaveBeenCalledOnce();
      expect(mockDepartmentService.getDepartment).toHaveBeenCalledWith(RepositoryType.PostgreSQL, TEST_1ST_DEPARTMENT.id);
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
        .post(DEPARTMENTS_URI).send(expectedDepartment);
      // THEN
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(mockDepartmentService.createDepartment).toHaveBeenCalledOnce();
      const [actualRepositoryType, actualDepartment] = vi.mocked(mockDepartmentService.createDepartment).mock.calls[0];
      expect(actualRepositoryType).toBe(RepositoryType.PostgreSQL);
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
        .patch(DEPARTMENTS_URI + expectedDepartment.id).send(expectedDepartment);
      // THEN
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(mockDepartmentService.updateDepartment).toHaveBeenCalledOnce();
      const [actualRepositoryType, actualDepartment] = vi.mocked(mockDepartmentService.updateDepartment).mock.calls[0];
      expect(actualRepositoryType).toBe(RepositoryType.PostgreSQL);
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
        .delete(DEPARTMENTS_URI + expectedDepartment.id);
      // THEN
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(mockDepartmentService.deleteDepartment).toHaveBeenCalledOnce();
      expect(mockDepartmentService.deleteDepartment).toHaveBeenCalledWith(RepositoryType.PostgreSQL, expectedDepartment.id);
    });
  });
  /**
   * Suite of tests with default repository for employee controller.
   */
  describe(getSuiteNameInYellow('Employee Controller'), () => {
    const mockEmployeeService = createMockEmployeeService();
    const employeeController = new EmployeeController(mockEmployeeService);
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
        .get(EMPLOYEES_URI);
      // THEN
      expect(response.status).toBe(StatusCodes.OK);
      const actualEmployees = response.body as Employee[];
      checkEmployees(TEST_1ST_EMPLOYEE, actualEmployees);
      expect(mockEmployeeService.getEmployees).toHaveBeenCalledOnce();
      expect(mockEmployeeService.getEmployees).toHaveBeenCalledWith(RepositoryType.PostgreSQL);
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
        .get(EMPLOYEES_URI + TEST_1ST_EMPLOYEE.id);
      // THEN
      expect(response.status).toBe(StatusCodes.OK);
      const actualEmployee = response.body as Employee;
      checkEmployee(TEST_1ST_EMPLOYEE, actualEmployee);
      expect(mockEmployeeService.getEmployee).toHaveBeenCalledOnce();
      expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(RepositoryType.PostgreSQL, TEST_1ST_EMPLOYEE.id);
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
      const response = await request(application).post(EMPLOYEES_URI).send(expectedEmployee);
      // THEN
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(mockEmployeeService.createEmployee).toHaveBeenCalledOnce();
      const [actualRepositoryType, actualEmployee] = vi.mocked(mockEmployeeService.createEmployee).mock.calls[0];
      expect(actualRepositoryType).toBe(RepositoryType.PostgreSQL);
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
        .patch(EMPLOYEES_URI + TEST_EMPLOYEE_UPDATED.id).send(expectedEmployee);
      // THEN
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(mockEmployeeService.updateEmployee).toHaveBeenCalledOnce();
      const [actualRepositoryType, actualEmployee] = vi.mocked(mockEmployeeService.updateEmployee).mock.calls[0];
      expect(actualRepositoryType).toBe(RepositoryType.PostgreSQL);
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
        .delete(EMPLOYEES_URI + expectedEmployee.id);
      // THEN
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledOnce();
      expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(
        RepositoryType.PostgreSQL, expectedEmployee.id);
    });
  });
  /**
   * Suite of tests with default repository for transfer controller.
   */
  describe(getSuiteNameInYellow('Transfer Controller'), () => {
    const mockTransferService = createMockTransferService();
    const transferController = new TransferController(mockTransferService);
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
        .post(TRANSFERS_URI).send(transferRequest);
      // THEN
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(mockTransferService.transferEmployees).toHaveBeenCalledOnce();
      expect(mockTransferService.transferEmployees).toHaveBeenCalledWith(
        RepositoryType.PostgreSQL, TEST_1ST_DEPARTMENT.id, TEST_2ND_DEPARTMENT.id, TEST_ALL_EMPLOYEE_IDS);
    });
  });
}