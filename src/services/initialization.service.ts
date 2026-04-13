import { Department } from "../models/department.js";
import { RepositoryType } from "../repositories/repository-type.js";
import { CassandraInitialization } from "../repositories/cassandra/cassandra.initialization.js";
import { MongoDbInitialization } from "../repositories/mongodb/mongodb.initialization.js";
import { MySqlInitialization } from "../repositories/mysql/mysql.initialization.js";
import { OracleInitialization } from "../repositories/oracle/oracle.initialization.js";
import { PostgreSQLInitialization } from "../repositories/postgresql/postgresql.initialization.js";
import { SQLServerInitialization } from "../repositories/sql-server/sql-server.initialization.js";
import { RedisInitialization } from "../repositories/redis/redis.initialization.js";

/**
 * This service class provides methods to initialize the database and load initial data.
 */
export class InitializationService {
  cassandraInitialization: CassandraInitialization = new CassandraInitialization();
  mongoDbInitialization: MongoDbInitialization = new MongoDbInitialization();
  mySqlInitialization: MySqlInitialization = new MySqlInitialization();
  oracleInitialization: OracleInitialization = new OracleInitialization();
  postgreSQLInitialization: PostgreSQLInitialization = new PostgreSQLInitialization();
  sqlServerInitialization: SQLServerInitialization = new SQLServerInitialization();
  redisInitialization: RedisInitialization = new RedisInitialization();
  /**
   * Loads the initial data into the database.
   * @param repositoryType the type of repository to use
   * @param departmentArray the array of departments
   * @returns void
   */
  async loadInitialData(repositoryType: RepositoryType, departmentArray: Department[]) {
    switch (repositoryType) {
      case RepositoryType.Cassandra:
        await this.cassandraInitialization.loadInitialData(departmentArray);
        break;
      case RepositoryType.Chroma:
        break;
      case RepositoryType.Elasticsearch:
        break;
      case RepositoryType.MongoDB:
        await this.mongoDbInitialization.loadInitialData(departmentArray);
        break;
      case RepositoryType.MySQL:
        await this.mySqlInitialization.loadInitialData(departmentArray);
        break;
      case RepositoryType.Neo4j:
        break;
      case RepositoryType.Oracle:
        await this.oracleInitialization.loadInitialData(departmentArray);
        break;
      case RepositoryType.PostgreSQL:
        await this.postgreSQLInitialization.loadInitialData(departmentArray);
        break;
      case RepositoryType.Redis:
        await this.redisInitialization.loadInitialData(departmentArray);
        break;
      case RepositoryType.SQLServer:
        await this.sqlServerInitialization.loadInitialData(departmentArray);
        break;
    }
  }
}