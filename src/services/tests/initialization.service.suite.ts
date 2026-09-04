import { Department } from "../../models/department.js";
import { Title } from "../../models/title.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { INITIAL_DATA } from '../services.constants.js';
import { it, expect, afterAll } from "vitest";

/**
 * Unit tests for the {@link InitializationService}.
 *
 * NOTE: previously this service had no dedicated test suite of its own -
 * it was only ever invoked indirectly, inside the `beforeAll()` hooks of
 * the Department/Employee/Transfer suites. This suite tests it directly.
 *
 * @param repositoryType the repository type
 */
export function initializationServiceTests(repositoryType: RepositoryType) {
  const initializationService = new InitializationService();
  const departmentService = new DepartmentService();
  const UNKNOWN_REPOSITORY_TYPE = 'UnknownRepositoryType' as RepositoryType;

  // Restore INITIAL_DATA once this suite is done, so it doesn't leave a
  // custom/minimal data set behind for whichever suite runs next. (Not
  // strictly required since Department/Employee/Transfer suites each have
  // their own beforeAll() reload, but it's a good defensive habit.)
  afterAll(async () => {
    await initializationService.loadInitialData(repositoryType, []);
  }, 90_000);

  it('should load the default INITIAL_DATA when an empty array is given', async () => {
    // GIVEN
    // WHEN
    await initializationService.loadInitialData(repositoryType, []);
    // THEN
    const actualDepartments = await departmentService.getDepartments(repositoryType);
    expect(actualDepartments).toHaveLength(INITIAL_DATA.length);
    const actualFirst = actualDepartments.find(dep => dep.id === INITIAL_DATA[0].id);
    expect(actualFirst?.name).toBe(INITIAL_DATA[0].name);
  });

  it('should load a custom (minimal) department array instead of the default data', async () => {
    // GIVEN a custom data set with a single department and a single employee -
    // exercising the "minimal" shape of an entire data load, not just of a
    // single record.
    const customData: Department[] = [
      {
        id: 1,
        name: 'Custom Only Department',
        employees: [
          {
            id: 1,
            departmentId: 1,
            firstName: 'Custom',
            lastName: 'Employee',
            title: Title.Analyst,
            phone: '+1 555-000-0000',
            mail: 'custom.employee@example.com',
          },
        ],
      },
    ];
    // WHEN
    await initializationService.loadInitialData(repositoryType, customData);
    // THEN
    const actualDepartments = await departmentService.getDepartments(repositoryType);
    expect(actualDepartments).toHaveLength(1);
    expect(actualDepartments[0].name).toBe('Custom Only Department');
    expect(actualDepartments[0].employees).toHaveLength(1);
  });

  it('should load a custom department array with the MAXIMAL number of departments', async () => {
    // GIVEN a larger data set than INITIAL_DATA, each department with no
    // employees, to check that loadInitialData() isn't hard-coded to
    // INITIAL_DATA's original shape/size (e.g. an off-by-one on department
    // count, or a fixed-size array/table somewhere in a repository).
    const departmentCount = INITIAL_DATA.length * 2;
    const customData: Department[] = Array.from({ length: departmentCount }, (_, i) => ({
      id: i + 1,
      name: `Bulk Department ${i + 1}`,
      employees: [],
    }));
    // WHEN
    await initializationService.loadInitialData(repositoryType, customData);
    // THEN
    const actualDepartments = await departmentService.getDepartments(repositoryType);
    expect(actualDepartments).toHaveLength(departmentCount);
  });

  it('should throw ReferenceError for an unimplemented repository type', async () => {
    await expect(
      initializationService.loadInitialData(UNKNOWN_REPOSITORY_TYPE, [])
    ).rejects.toThrow(ReferenceError);
  });
}
