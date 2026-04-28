import { Department } from "../models/department.js";
import { RepositoryType } from "../repositories/repository-type.js";
import { Initialization } from "../repositories/initialization.js";
import { CassandraInitialization } from "../repositories/cassandra/cassandra.initialization.js";
import { ElasticsearchInitialization } from "../repositories/elasticsearch/elasticsearch.initialization.js";
import { MongoDbInitialization } from "../repositories/mongodb/mongodb.initialization.js";
import { MySqlInitialization } from "../repositories/mysql/mysql.initialization.js";
import { Neo4jInitialization } from "../repositories/neo4j/neo4j.initialization.js";
import { OracleInitialization } from "../repositories/oracle/oracle.initialization.js";
import { PostgreSQLInitialization } from "../repositories/postgresql/postgresql.initialization.js";
import { SQLServerInitialization } from "../repositories/sql-server/sql-server.initialization.js";
import { RedisInitialization } from "../repositories/redis/redis.initialization.js";

/**
 * This service class provides methods to initialize the database and load initial data.
 */
export class InitializationService {

  private readonly strategies: Partial<Record<RepositoryType, Initialization>>;
  /**
   * Initializes the service with available repository strategies.
   */  
  constructor() {
    this.strategies = {
      [RepositoryType.Cassandra]: new CassandraInitialization(),
      [RepositoryType.Elasticsearch]: new ElasticsearchInitialization(),
      [RepositoryType.MongoDB]: new MongoDbInitialization(),
      [RepositoryType.MySQL]: new MySqlInitialization(),
      [RepositoryType.Neo4j]: new Neo4jInitialization(),
      [RepositoryType.Oracle]: new OracleInitialization(),
      [RepositoryType.PostgreSQL]: new PostgreSQLInitialization(),
      [RepositoryType.SQLServer]: new SQLServerInitialization(),
      [RepositoryType.Redis]: new RedisInitialization(),
    };
  }
  /**
   * Loads the initial data into the database.
   * @param repositoryType the type of repository to use
   * @param departmentArray the array of departments
   * @returns void
   */
  async loadInitialData(repositoryType: RepositoryType, departmentArray: Department[]): Promise<void> {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("InitializationService.loadInitialData(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    await strategy.loadInitialData(departmentArray);
  }
}