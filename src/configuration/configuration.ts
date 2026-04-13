import dotenv from 'dotenv';

dotenv.config({ quiet: true });
/**
 * Configuration interface for the application.
 */
interface Config {
  port: number;
  cassandraHost: string;
  cassandraLocalDataCenter: string;
  mongoDbUri: string;
  mongoDbDatabase: string;
  mySqlHost: string;
  mySqlPort: number;
  mySqlDatabase: string;
  mySqlUser: string;
  mySqlPassword: string;
  oracleConnectString: string;
  oracleUser: string;
  oraclePassword: string;
  postgreSqlHost: string;
  postgreSqlPort: number;
  postgreSqlDatabase: string;
  postgreSqlUser: string;
  postgreSqlPassword: string;
  redisUrl: string;
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
  mongoDbUri: String(process.env.MONGODB_URI),
  mongoDbDatabase: String(process.env.MONGODB_DATABASE),
  mySqlHost: String(process.env.MY_SQL_HOST),
  mySqlPort: Number(process.env.MY_SQL_PORT),
  mySqlDatabase: String(process.env.MY_SQL_DATABASE),
  mySqlUser: String(process.env.MY_SQL_USER),
  mySqlPassword: String(process.env.MY_SQL_PASSWORD),
  oracleConnectString: String(process.env.ORACLE_CONNECT_STRING),
  oracleUser: String(process.env.ORACLE_USER),
  oraclePassword: String(process.env.ORACLE_PASSWORD),
  postgreSqlHost: String(process.env.POSTGRESQL_HOST),
  postgreSqlPort: Number(process.env.POSTGRESQL_PORT),
  postgreSqlDatabase: String(process.env.POSTGRESQL_DATABASE),
  postgreSqlUser: String(process.env.POSTGRESQL_USER),
  postgreSqlPassword: String(process.env.POSTGRESQL_PASSWORD),
  redisUrl: String(process.env.REDIS_URL),
  sqlServerHost: String(process.env.SQL_SERVER_HOST),
  sqlServerPort: Number(process.env.SQL_SERVER_PORT),
  sqlServerDatabase: String(process.env.SQL_SERVER_DATABASE),
  sqlServerUser: String(process.env.SQL_SERVER_USER),
  sqlServerPassword: String(process.env.SQL_SERVER_PASSWORD),
};
