import dotenv from 'dotenv';

dotenv.config({ quiet: true });
/**
 * Configuration interface for the application.
 */
interface Config {
  port: number;
  cassandraHost: string;
  cassandraLocalDataCenter: string;
  elasticsearchHost: string;
  elasticsearchPort: number;
  mongoDbHost: string;
  mongoDbPort: number;
  mongoDbDatabase: string;
  mongoDbUser: string;
  mongoDbPassword: string;
  mySqlHost: string;
  mySqlPort: number;
  mySqlDatabase: string;
  mySqlUser: string;
  mySqlPassword: string;
  oracleHost: string;
  oraclePort: number;
  oracleUser: string;
  oraclePassword: string;
  postgreSqlHost: string;
  postgreSqlPort: number;
  postgreSqlDatabase: string;
  postgreSqlUser: string;
  postgreSqlPassword: string;
  redisHost: string;
  redisPort: number;
  sqlServerHost: string;
  sqlServerPort: number;
  sqlServerDatabase: string;
  sqlServerUser: string;
  sqlServerPassword: string;
}
/**
 * Configuration object for the application.
 */
export const config: Config = {
  port: Number(process.env.PORT),
  cassandraHost: String(process.env.CASSANDRA_HOST),
  cassandraLocalDataCenter: String(process.env.CASSANDRA_DC),
  elasticsearchHost: String(process.env.ELASTICSEARCH_HOST),
  elasticsearchPort: Number(process.env.ELASTICSEARCH_PORT),
  mongoDbHost: String(process.env.MONGODB_HOST),
  mongoDbPort: Number(process.env.MONGODB_PORT),
  mongoDbDatabase: String(process.env.MONGODB_DATABASE),
  mongoDbUser: String(process.env.MONGODB_USER),
  mongoDbPassword: String(process.env.MONGODB_PASSWORD),
  mySqlHost: String(process.env.MY_SQL_HOST),
  mySqlPort: Number(process.env.MY_SQL_PORT),
  mySqlDatabase: String(process.env.MY_SQL_DATABASE),
  mySqlUser: String(process.env.MY_SQL_USER),
  mySqlPassword: String(process.env.MY_SQL_PASSWORD),
  oracleHost: String(process.env.ORACLE_HOST),
  oraclePort: Number(process.env.ORACLE_PORT),
  oracleUser: String(process.env.ORACLE_USER),
  oraclePassword: String(process.env.ORACLE_PASSWORD),
  postgreSqlHost: String(process.env.POSTGRESQL_HOST),
  postgreSqlPort: Number(process.env.POSTGRESQL_PORT),
  postgreSqlDatabase: String(process.env.POSTGRESQL_DATABASE),
  postgreSqlUser: String(process.env.POSTGRESQL_USER),
  postgreSqlPassword: String(process.env.POSTGRESQL_PASSWORD),
  redisHost: String(process.env.REDIS_HOST),
  redisPort: Number(process.env.REDIS_PORT),
  sqlServerHost: String(process.env.SQL_SERVER_HOST),
  sqlServerPort: Number(process.env.SQL_SERVER_PORT),
  sqlServerDatabase: String(process.env.SQL_SERVER_DATABASE),
  sqlServerUser: String(process.env.SQL_SERVER_USER),
  sqlServerPassword: String(process.env.SQL_SERVER_PASSWORD),
};
