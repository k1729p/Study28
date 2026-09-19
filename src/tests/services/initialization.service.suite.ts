import { describe, it, afterEach } from "vitest";

import { Department } from "../../models/department.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../../services/initialization.service.js';
import { DepartmentService } from '../../services/department.service.js';
import { checkDefaultDepartments, checkDepartments } from '../checkers.js';
import {
  TEST_MINIMAL_DATA,
  TEST_BIG_DATA
} from '../tests.constants.js';

/**
 * Unit tests for the {@link InitializationService}.
 * This test suite verifies that the {@link InitializationService} functions correctly.
 * @param repositoryType the repository type
 */
export function initializationServiceTests(repositoryType: RepositoryType) {
  const initializationService = new InitializationService();
  const departmentService = new DepartmentService();

  /**
   * Suite of tests for the initialization.
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
