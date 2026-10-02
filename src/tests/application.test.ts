import { describe } from 'vitest';

import { RepositoryType } from '../repositories/repository-type.js';
import { initializationControllerTests } from './controllers/initialization.controller.suite.js';
import { departmentControllerTests } from './controllers/department.controller.suite.js';
import { employeeControllerTests } from './controllers/employee.controller.suite.js';
import { transferControllerTests } from './controllers/transfer.controller.suite.js';
import { controllerTestsWithDefaultRepository } from './controllers/default.repository.suite.js';
import { initializationServiceTests } from './services/initialization.service.suite.js';
import { departmentServiceTests } from './services/department.service.suite.js';
import { employeeServiceTests } from './services/employee.service.suite.js';
import { transferServiceTests } from './services/transfer.service.suite.js';
import { serviceTestsWithUnknownRepository } from './services/unknown.repository.suite.js';
import { getSuiteNameInCyan, getSuiteNameInYellow } from "./tests.helpers.js";

const TEST_REPOSITORY_TYPES = [
  RepositoryType.Cassandra,
  RepositoryType.Chroma,
  RepositoryType.Elasticsearch,
  RepositoryType.MongoDB,
  RepositoryType.MySQL,
  RepositoryType.Neo4j,
  RepositoryType.Oracle,
  RepositoryType.PostgreSQL,
  RepositoryType.Redis,
  RepositoryType.SQLServer,
];

/*
 * Controller tests orchestrator.
 */
describe.for(TEST_REPOSITORY_TYPES)(getSuiteNameInCyan(`%s`), (repositoryType) => {
  describe(getSuiteNameInYellow('Initialization Controller'), () => initializationControllerTests(repositoryType));
  describe(getSuiteNameInYellow('Department Controller'), () => departmentControllerTests(repositoryType));
  describe(getSuiteNameInYellow('Employee Controller'), () => employeeControllerTests(repositoryType));
  describe(getSuiteNameInYellow('Transfer Controller'), () => transferControllerTests(repositoryType));
});

/*
 * Controller tests with default repository.
 */
describe(getSuiteNameInCyan('default'), () => controllerTestsWithDefaultRepository());

/*
 * Service tests orchestrator.
 */
describe.for(TEST_REPOSITORY_TYPES)(getSuiteNameInCyan(`%s`), (repositoryType) => {
  describe(getSuiteNameInYellow('Initialization Service'), () => initializationServiceTests(repositoryType));
  describe(getSuiteNameInYellow('Department Service'), () => departmentServiceTests(repositoryType));
  describe(getSuiteNameInYellow('Employee Service'), () => employeeServiceTests(repositoryType));
  describe(getSuiteNameInYellow('Transfer Service'), () => transferServiceTests(repositoryType));
});

/*
 * Service tests orchestrator with unknown repository.
 */
describe(getSuiteNameInCyan('unknown'), () => serviceTestsWithUnknownRepository());
