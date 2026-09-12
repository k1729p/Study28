import { describe, it, afterEach } from "vitest";

import { Department } from "../../models/department.js";
import { Title } from "../../models/title.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { checkDefaultDepartments, checkDepartments } from './checkers.js';

/**
 * Unit tests for the {@link InitializationService}.
 * This test suite verifies that the {@link InitializationService} functions correctly.
 * @param repositoryType the repository type
 */
export function initializationServiceTests(repositoryType: RepositoryType) {
  const initializationService = new InitializationService();
  const departmentService = new DepartmentService();
  const TEST_MINIMAL_DATA: Department[] = [{
    id: 12345,
    name: 'D',
    employees: [{
      id: 67890,
      departmentId: 12345,
      firstName: 'FN',
      lastName: 'LN',
      title: Title.Analyst,
      phone: '+1 555-000-0000',
      mail: 'a@example.com',
    }],
  }];
  const BIG_DEPARTMENTS_COUNT = 20;
  const BIG_EMPLOYEES_IN_DEPARTMENT_COUNT = 1000 / BIG_DEPARTMENTS_COUNT;
  const TEST_BIG_DATA: Department[] = Array.from({ length: BIG_DEPARTMENTS_COUNT }, (_, i) => ({
    id: i + 1,
    name: `Department ${i + 1}`,
    employees: Array.from({ length: BIG_EMPLOYEES_IN_DEPARTMENT_COUNT }, (_, k) => ({
      id: 100 * i + k + 1,
      departmentId: i + 1,
      firstName: 'First Name',
      lastName: `Employee ${100 * i + k + 1}`,
      title: Title.Analyst,
      phone: '+1 000-000-0000',
      mail: 'a@b.com',
    })),
  }));

  /**
   * Suite of tests for the transfer when ID is out of range.
   */
  describe.for([
    ["default dataset", []],
    ["minimal dataset", TEST_MINIMAL_DATA],
    ["big dataset", TEST_BIG_DATA],
  ])('test with %s',
    ([info, testInitialData]) => {
      /**
       * Tests the initialization with test dataset.
       */
      it('should load the initial data', async () => {
        // GIVEN
        const expectedDepartments = testInitialData as Department[];
        // WHEN
        await initializationService.loadInitialData(repositoryType, expectedDepartments);
        // THEN
        const actualDepartments = await departmentService.getDepartments(repositoryType);
        if (expectedDepartments.length > 0) {
          checkDepartments(expectedDepartments, actualDepartments);
        } else {
          checkDefaultDepartments(actualDepartments);

        }
      }, 90_000);
      /**
       * Cleanup after test. Restore initial dataset.
       */
      afterEach(async () => {
        await initializationService.loadInitialData(repositoryType, []);
      }, 90_000);
    });
}
