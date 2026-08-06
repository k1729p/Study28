import { RepositoryType } from '../../repositories/repository-type.js';
import { departmentServiceTests } from './department.service.suite.js';
import { employeeServiceTests } from './employee.service.suite.js';
import { transferServiceTests } from './transfer.service.suite.js';
import * as colors from "../../utils/colors.js";
import { describe } from "vitest";
/*
 * Tests orchestrator.
 */
describe.for([
  RepositoryType.MongoDB,
  RepositoryType.MySQL,
  RepositoryType.Oracle,
  RepositoryType.PostgreSQL,
  RepositoryType.SQLServer,
])(colors.CYAN_BRIGHT + 'Repository type █ %s █' + colors.RESET, (repositoryType) => {
  describe(colors.YELLOW_BRIGHT + 'Department service tests' + colors.RESET,
    () => departmentServiceTests(repositoryType));
  describe(colors.YELLOW_BRIGHT + 'Employee service tests' + colors.RESET,
    () => employeeServiceTests(repositoryType));
  describe(colors.YELLOW_BRIGHT + 'Transfer service tests' + colors.RESET,
    () => transferServiceTests(repositoryType));
});
