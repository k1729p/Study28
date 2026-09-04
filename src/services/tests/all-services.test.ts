import { RepositoryType } from '../../repositories/repository-type.js';
import { initializationServiceTests } from './initialization.service.suite.js';
import { departmentServiceTests } from './department.service.suite.js';
import { employeeServiceTests } from './employee.service.suite.js';
import { transferServiceTests } from './transfer.service.suite.js';
import * as colors from "../../utils/colors.js";
import { describe } from "vitest";

//###############################################################################################
import { aaaaaTests } from './aaaaa.js';
//###############################################################################################


/*
 * Tests orchestrator.
 */
describe.for([
  // RepositoryType.Cassandra,
  // RepositoryType.Chroma,// OK OK OK OK OK OK OK OK OK OK OK OK OK
  // RepositoryType.Elasticsearch,// OK OK OK OK OK OK OK OK OK OK OK OK OK
  // RepositoryType.MongoDB,
  // RepositoryType.MySQL,
  // RepositoryType.Neo4j,// OK OK OK OK OK OK OK OK OK OK OK OK OK
  // RepositoryType.Oracle,
  RepositoryType.PostgreSQL,
  // RepositoryType.Redis,// OK OK OK OK OK OK OK OK OK OK OK OK OK
  // RepositoryType.SQLServer,
])(colors.CYAN_BRIGHT + 'Repository type █ %s █' + colors.RESET, (repositoryType) => {

//  describe(getSuiteName('Aaaaa'), () => aaaaaTests(repositoryType));

  // describe(getSuiteName('Initialization'), () => initializationServiceTests(repositoryType));
  // describe(getSuiteName('Department'), () => departmentServiceTests(repositoryType));
  // describe(getSuiteName('Employee'), () => employeeServiceTests(repositoryType));
  describe(getSuiteName('Transfer'), () => transferServiceTests(repositoryType));
});
/**
 * Gets the suite name.
 * @param label the label for test suite
 * @returns the suite name
 */
const getSuiteName = (label: string): string => {
  return colors.YELLOW_BRIGHT + label + ' service tests' + colors.RESET;
}
