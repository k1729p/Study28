import { Aaa } from './aaa/aaa.js';
// ####################################################################################################
import express, { Request, Response, NextFunction, Router } from 'express';
import { Server } from 'http';
import cors from 'cors';
import { config } from "./configuration/configuration.js";
import { clientPromise as cassandraClientPromise } from "./repositories/cassandra/cassandra.pool.js";
import { clientPromise as elasticsearchClientPromise } from "./repositories/elasticsearch/elasticsearch.pool.js";
import { poolPromise as mongoDbPoolPromise } from "./repositories/mongodb/mongodb.pool.js";
import { poolPromise as mySqlPoolPromise } from "./repositories/mysql/mysql.pool.js";
import { driverPromise as neo4jDriverPromise } from "./repositories/neo4j/neo4j.pool.js";
import { poolPromise as oraclePoolPromise } from "./repositories/oracle/oracle.pool.js";
import { poolPromise as postgreSqlPoolPromise } from "./repositories/postgresql/postgresql.pool.js";
import { poolPromise as sqlServerPoolPromise } from "./repositories/sql-server/sql-server.pool.js";
import { clientPromise as redisClientPromise } from "./repositories/redis/redis.pool.js";
import { DepartmentController } from './controllers/department.controller.js';
import { EmployeeController } from './controllers/employee.controller.js';
import { InitializationController } from './controllers/initialization.controller.js';
import { TransferController } from './controllers/transfer.controller.js';
import { RED_BRIGHT, RESET } from "./utils/colors.js";

main();

const BANNER = `
╭────────────────────────────╮
│ ▀▄▀▄▀▄▀▄▀▄ Study 28 ▀▄▀▄▀▄▀▄▀▄ │
╰────────────────────────────╯`;
/**
 * This is the main entry point of the application.
 */
function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use('/api/', createRouting());
  app.use(errorHandler);
  const server = app.listen(config.port, () => {
    console.log('main(): server is running on port[%s%d%s]', RED_BRIGHT, config.port, RESET);
    initializeDatabasePools();
  });
  process.on('SIGINT', async () => shutdownServer(server));
  process.on('SIGTERM', async () => shutdownServer(server));
}
/**
 * This function creates a new Router instance and sets up a basic route.
 * @returns Router
 */
function createRouting(): Router {
  const router = Router();
  // // ####################################################################################################
  router.get('/initialize/', new Aaa().initialize);
  router.get('/read/', new Aaa().read);
  // // ####################################################################################################
  const initializationController = new InitializationController();
  router.post('/load/', initializationController.loadInitialData);

  const departmentController = new DepartmentController();
  router.post('/departments/', departmentController.createDepartment);
  router.get('/departments/', departmentController.getDepartments);
  router.get('/departments/:id', departmentController.getDepartmentById);
  router.patch('/departments/:id', departmentController.updateDepartment);
  router.delete('/departments/:id', departmentController.deleteDepartment);

  const employeeController = new EmployeeController();
  router.post('/employees/', employeeController.createEmployee);
  router.get('/employees/', employeeController.getEmployees);
  router.get('/employees/:id', employeeController.getEmployeeById);
  router.patch('/employees/:id', employeeController.updateEmployee);
  router.delete('/employees/:id', employeeController.deleteEmployee);

  const transferController = new TransferController();
  router.post('/transfers/', transferController.transferEmployees);
  return router;
}
/**
 * Error handling middleware.
 * @param err - The error object.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  res.status(500).json('Internal Server Error');
  next(err);
  console.error("errorHandler():", err);
}
/**
 * Initialize and verify all database pools are ready
 */
async function initializeDatabasePools() {
  try {
    await Promise.all([
      cassandraClientPromise,
      elasticsearchClientPromise,
      mongoDbPoolPromise,
      mySqlPoolPromise,
      neo4jDriverPromise,
      oraclePoolPromise,
      postgreSqlPoolPromise,
      sqlServerPoolPromise,
      redisClientPromise
    ]);
  } catch (err) {
    console.error('initializeDatabasePools(): error initializing database pools:', err);
    process.exit(1);
  }
  console.log('initializeDatabasePools(): database pools started, UTC time[%s], time[%s]%s',
    new Date().toUTCString().slice(17, 25), new Date().toTimeString().slice(0, 8), BANNER
  );
}
/**
 * Shutdowns the Express server.
 * @param server the server
 */
function shutdownServer(server: Server) {
  console.log('shutdownServer(): shutdown signal received');
  server.close(async () => {
    console.log("shutdownServer(): HTTP server closed");
    try {
      await (await cassandraClientPromise).shutdown();
      console.log("shutdownServer(): Cassandra client shut down");
      await (await elasticsearchClientPromise).close();
      console.log("shutdownServer(): Elasticsearch client closed");
      await (await mongoDbPoolPromise).close();
      console.log("shutdownServer(): MongoDB pool closed");
      await (await mySqlPoolPromise).end();
      console.log("shutdownServer(): MySQL pool ended");
      await (await oraclePoolPromise).close();
      console.log("shutdownServer(): Neo4j driver closed");
      await (await neo4jDriverPromise).close();
      console.log("shutdownServer(): Oracle pool closed");
      await (await postgreSqlPoolPromise).end();
      console.log("shutdownServer(): PostgreSQL pool ended");
      await (await sqlServerPoolPromise).close();
      console.log("shutdownServer(): SQL Server pool closed");
      await (await redisClientPromise).quit();
      console.log("shutdownServer(): Redis client quitted");
    } catch (err) {
      console.error("shutdownServer(): error during database shutdown:", err);
      process.exit(1);
    }
    console.log("shutdownServer(): shutdown completed");
    process.exit(0);
  });
  // Forced shutdown if graceful closing takes too long
  setTimeout(() => {
    console.error("shutdownServer(): could not close connections in time, forceful exit");
    process.exit(1);
  }, 10000);
}
