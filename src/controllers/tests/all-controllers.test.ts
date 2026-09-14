import { describe } from 'vitest';

import { RepositoryType } from '../../repositories/repository-type.js';
import { initializationControllerTests } from './initialization.controller.suite.js';
import { departmentControllerTests } from './department.controller.suite.js';
import { employeeControllerTests } from './employee.controller.suite.js';
import { transferControllerTests } from './transfer.controller.suite.js';
import * as colors from "../../utils/colors.js";

/*
 * Tests orchestrator.
 */
describe.for([
  // RepositoryType.Cassandra,
  // RepositoryType.Chroma,
  // RepositoryType.Elasticsearch,
  // RepositoryType.MongoDB,
  // RepositoryType.MySQL,
  // RepositoryType.Neo4j,
  // RepositoryType.Oracle,
  // RepositoryType.PostgreSQL,
  // RepositoryType.Redis,
  RepositoryType.SQLServer,
])(colors.CYAN_BRIGHT + 'Repository type █ %s █' + colors.RESET, (repositoryType) => {
  describe(getSuiteName('Initialization'), () => initializationControllerTests(repositoryType));
  describe(getSuiteName('Department'), () => departmentControllerTests(repositoryType));
  describe(getSuiteName('Employee'), () => employeeControllerTests(repositoryType));
  describe(getSuiteName('Transfer'), () => transferControllerTests(repositoryType));
});

/**
 * Gets the suite name.
 * @param label the label for test suite
 * @returns the suite name
 */
const getSuiteName = (label: string): string => {
  return colors.YELLOW_BRIGHT + label + ' service tests' + colors.RESET;
}
