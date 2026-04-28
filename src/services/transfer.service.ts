import { RepositoryType } from "../repositories/repository-type.js";
import { DepartmentRepository } from "../repositories/department.repository.js";
import { CassandraDepartmentRepository } from "../repositories/cassandra/cassandra.department.repository.js";
import { ElasticsearchDepartmentRepository } from "../repositories/elasticsearch/elasticsearch.department.repository.js";
import { MongoDbDepartmentRepository } from "../repositories/mongodb/mongodb.department.repository.js";
import { MySqlDepartmentRepository } from "../repositories/mysql/mysql.department.repository.js";
import { Neo4jDepartmentRepository } from "../repositories/neo4j/neo4j.department.repository.js";
import { OracleDepartmentRepository } from "../repositories/oracle/oracle.department.repository.js";
import { PostgreSQLDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";
import { RedisDepartmentRepository } from "../repositories/redis/redis.department.repository.js";
import { SQLServerDepartmentRepository } from "../repositories/sql-server/sql-server.department.repository.js";
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
      [RepositoryType.Elasticsearch]: new ElasticsearchDepartmentRepository(),
      [RepositoryType.MongoDB]: new MongoDbDepartmentRepository(),
      [RepositoryType.MySQL]: new MySqlDepartmentRepository(),
      [RepositoryType.Neo4j]: new Neo4jDepartmentRepository(),
      [RepositoryType.Oracle]: new OracleDepartmentRepository(),
      [RepositoryType.PostgreSQL]: new PostgreSQLDepartmentRepository(),
      [RepositoryType.Redis]: new RedisDepartmentRepository(),
      [RepositoryType.SQLServer]: new SQLServerDepartmentRepository(),
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
      console.warn("DepartmentService.createDepartment(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    return await strategy.transferEmployees(
          sourceDepartmentId, targetDepartmentId, employeeIds);
  }
}