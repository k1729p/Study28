import { RepositoryType } from "../repositories/repository-type.js";
import { Transfer } from "../repositories/transfer.js";
import { CassandraTransfer } from "../repositories/cassandra/cassandra.transfer.js";
import { ChromaTransfer } from "../repositories/chroma/chroma.transfer.js";
import { ElasticsearchTransfer } from "../repositories/elasticsearch/elasticsearch.transfer.js";
import { MongoDbTransfer } from "../repositories/mongodb/mongodb.transfer.js";
import { MySqlTransfer } from "../repositories/mysql/mysql.transfer.js";
import { Neo4jTransfer } from "../repositories/neo4j/neo4j.transfer.js";
import { OracleTransfer } from "../repositories/oracle/oracle.transfer.js";
import { PostgreSqlTransfer } from "../repositories/postgresql/postgresql.transfer.js";
import { RedisTransfer } from "../repositories/redis/redis.transfer.js";
import { SqlServerTransfer } from "../repositories/sql-server/sql-server.transfer.js";
import { MAX_INT_32, MAX_BATCH_EMPLOYEE_IDS } from './services.constants.js';
/**
 * This service class provides methods to transfer employees.
 */
export class TransferService {
  private readonly strategies: Partial<Record<RepositoryType, Transfer>>;
  /**
   * Initializes the service with available repository strategies.
   */
  constructor() {
    this.strategies = {
      [RepositoryType.Cassandra]: new CassandraTransfer(),
      [RepositoryType.Chroma]: new ChromaTransfer(),
      [RepositoryType.Elasticsearch]: new ElasticsearchTransfer(),
      [RepositoryType.MongoDB]: new MongoDbTransfer(),
      [RepositoryType.MySQL]: new MySqlTransfer(),
      [RepositoryType.Neo4j]: new Neo4jTransfer(),
      [RepositoryType.Oracle]: new OracleTransfer(),
      [RepositoryType.PostgreSQL]: new PostgreSqlTransfer(),
      [RepositoryType.Redis]: new RedisTransfer(),
      [RepositoryType.SQLServer]: new SqlServerTransfer(),
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
      console.error("TransferService.transferEmployees(): error, not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    if (!Number.isInteger(sourceDepartmentId) || sourceDepartmentId < 1 || sourceDepartmentId > MAX_INT_32) {
      console.error("TransferService.transferEmployees(): error, invalid sourceDepartmentId[%s]", sourceDepartmentId);
      throw new RangeError(`ID must be an integer between 1 and ${MAX_INT_32}, inclusive.`);
    }
    if (!Number.isInteger(targetDepartmentId) || targetDepartmentId < 1 || targetDepartmentId > MAX_INT_32) {
      console.error("TransferService.transferEmployees(): error, invalid targetDepartmentId[%s]", targetDepartmentId);
      throw new RangeError(`ID must be an integer between 1 and ${MAX_INT_32}, inclusive.`);
    }
    if (!Array.isArray(employeeIds) || employeeIds.length > MAX_BATCH_EMPLOYEE_IDS) {
      console.error(`TransferService.transferEmployees(): error, invalid employee IDs array size.`);
      throw new RangeError(`Employee IDs count must not exceed ${MAX_BATCH_EMPLOYEE_IDS}.`);
    }
    if (employeeIds.length === 0) {
      console.warn("TransferService.transferEmployees(): " +
        "warning, no employee IDs provided. Nothing to transfer.");
      return;
    }
    if (sourceDepartmentId === targetDepartmentId) {
      console.warn("TransferService.transferEmployees():" +
        " warning, source and target departments are the same. Nothing to transfer.");
      return;
    }
    return await strategy.transferEmployees(
      sourceDepartmentId, targetDepartmentId, employeeIds);
  }
}