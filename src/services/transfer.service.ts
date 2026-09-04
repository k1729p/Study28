import { RepositoryType } from "../repositories/repository-type.js";
import { DepartmentRepository } from "../repositories/department.repository.js";
import { CassandraDepartmentRepository } from "../repositories/cassandra/cassandra.department.repository.js";
import { ChromaDepartmentRepository } from "../repositories/chroma/chroma.department.repository.js";
import { ElasticsearchDepartmentRepository } from "../repositories/elasticsearch/elasticsearch.department.repository.js";
import { MongoDbDepartmentRepository } from "../repositories/mongodb/mongodb.department.repository.js";
import { MySqlDepartmentRepository } from "../repositories/mysql/mysql.department.repository.js";
import { Neo4jDepartmentRepository } from "../repositories/neo4j/neo4j.department.repository.js";
import { OracleDepartmentRepository } from "../repositories/oracle/oracle.department.repository.js";
import { PostgreSqlDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";
import { RedisDepartmentRepository } from "../repositories/redis/redis.department.repository.js";
import { SqlServerDepartmentRepository } from "../repositories/sql-server/sql-server.department.repository.js";
import { MAX_INT_32 } from './services.constants.js';
/**
 * This service class provides methods to transfer employees.
 */
export class TransferService {
  private readonly strategies: Partial<Record<RepositoryType, DepartmentRepository>>;
  /**
   * Initializes the service with available repository strategies.
   */
  constructor() {
    this.strategies = {
      [RepositoryType.Cassandra]: new CassandraDepartmentRepository(),
      [RepositoryType.Chroma]: new ChromaDepartmentRepository(),
      [RepositoryType.Elasticsearch]: new ElasticsearchDepartmentRepository(),
      [RepositoryType.MongoDB]: new MongoDbDepartmentRepository(),
      [RepositoryType.MySQL]: new MySqlDepartmentRepository(),
      [RepositoryType.Neo4j]: new Neo4jDepartmentRepository(),
      [RepositoryType.Oracle]: new OracleDepartmentRepository(),
      [RepositoryType.PostgreSQL]: new PostgreSqlDepartmentRepository(),
      [RepositoryType.Redis]: new RedisDepartmentRepository(),
      [RepositoryType.SQLServer]: new SqlServerDepartmentRepository(),
    };
  }
  /**
   * Transfers the employees from the source department to the target department.
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the transferred employees array
   * @returns void
   */
  async transferEmployees(repositoryType: RepositoryType,
    sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]) {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("TransferService.transferEmployees(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    if (!Number.isInteger(sourceDepartmentId) || sourceDepartmentId < 1 || sourceDepartmentId > MAX_INT_32) {
      console.warn("TransferService.transferEmployees(): invalid sourceDepartmentId[%s]", sourceDepartmentId);
      throw new RangeError(`ID must be an integer between 1 and ${MAX_INT_32}, inclusive.`);
    }
    if (!Number.isInteger(targetDepartmentId) || targetDepartmentId < 1 || targetDepartmentId > MAX_INT_32) {
      console.warn("TransferService.transferEmployees(): invalid targetDepartmentId[%s]", targetDepartmentId);
      throw new RangeError(`ID must be an integer between 1 and ${MAX_INT_32}, inclusive.`);
    }
    return await strategy.transferEmployees(
      sourceDepartmentId, targetDepartmentId, employeeIds);
  }
}