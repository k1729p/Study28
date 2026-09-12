import { describe, beforeAll, it, expect, vi } from "vitest";
import request from 'supertest';
import express from 'express';

import { Employee } from "../../models/employee.js";
import { Title } from "../../models/title.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { EmployeeController } from '../employee.controller.js';
import { EmployeeService } from '../../services/employee.service.js';

import { INITIAL_DATA } from '../../services/services.constants.js';
import { checkEmployees, checkEmployee } from './checkers.js';

const EMPLOYEES_URI = '/employees/';
const EMPLOYEE_BY_ID_URI = '/employees/:id';

/**
 * Unit tests for the {@link EmployeeController}.
 * This test suite verifies that the {@link EmployeeController} functions correctly.
 * @param repositoryType the repository type
 */
export function employeeControllerTests(repositoryType: RepositoryType) {
  const mockEmployeeService: EmployeeService = {
    // AI - fill it with functions
  } as any;
  const employeeController = new EmployeeController(mockEmployeeService);

  it('DUMMY', async () => {});// dummy test to be replaced with given tests implementation
}
