import { Request, Response, NextFunction } from 'express';
import { Department } from "../models/department.js";
import { CassandraInitialization } from "../repositories/cassandra/cassandra.initialization.js";
import { CassandraDepartmentRepository } from "../repositories/cassandra/cassandra.department.repository.js";
import { MongoDbInitialization } from "../repositories/mongodb/mongodb.initialization.js";
import { MongoDbDepartmentRepository } from "../repositories/mongodb/mongodb.department.repository.js";
import { MySqlInitialization } from "../repositories/mysql/mysql.initialization.js";
import { MySqlDepartmentRepository } from "../repositories/mysql/mysql.department.repository.js";
import { OracleInitialization } from "../repositories/oracle/oracle.initialization.js";
import { OracleDepartmentRepository } from "../repositories/oracle/oracle.department.repository.js";
import { PostgreSQLInitialization } from "../repositories/postgresql/postgresql.initialization.js";
import { PostgreSQLDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";
import { SQLServerInitialization } from "../repositories/sql-server/sql-server.initialization.js";
import { SQLServerDepartmentRepository } from "../repositories/sql-server/sql-server.department.repository.js";
import { RedisInitialization } from "../repositories/redis/redis.initialization.js";
import { RedisDepartmentRepository } from "../repositories/redis/redis.department.repository.js";

import * as colors from "./../colors.js";
import { config as config } from "../configuration/configuration.js";

export class Aaa {
  cassandraInitialization: CassandraInitialization = new CassandraInitialization();
  cassandraDepartmentRepository: CassandraDepartmentRepository = new CassandraDepartmentRepository();
  mongoDbInitialization: MongoDbInitialization = new MongoDbInitialization();
  mongoDbDepartmentRepository: MongoDbDepartmentRepository = new MongoDbDepartmentRepository();
  mySqlInitialization: MySqlInitialization = new MySqlInitialization();
  mySqlDepartmentRepository: MySqlDepartmentRepository = new MySqlDepartmentRepository();
  oracleInitialization: OracleInitialization = new OracleInitialization();
  oracleDepartmentRepository: OracleDepartmentRepository = new OracleDepartmentRepository();
  postgreSQLInitialization: PostgreSQLInitialization = new PostgreSQLInitialization();
  postgreSQLDepartmentRepository: PostgreSQLDepartmentRepository = new PostgreSQLDepartmentRepository();
  sqlServerInitialization: SQLServerInitialization = new SQLServerInitialization();
  sqlServerDepartmentRepository: SQLServerDepartmentRepository = new SQLServerDepartmentRepository();
  redisInitialization: RedisInitialization = new RedisInitialization();
  redisDepartmentRepository: RedisDepartmentRepository = new RedisDepartmentRepository();

  aaa = async (req: Request, res: Response, next: NextFunction) => {
    const initArray: Department[] = JSON.parse(DEPARTMENTS_DATA_1).departments;
    const department: Department = JSON.parse(DEPARTMENTS_DATA_2);

    const flag = !true;
    const configFlag = true;
    if (configFlag) {
      console.log('Aaa.aaa(): port[%d],\n' +
        '   cassandraHost[%s], cassandraLocalDataCenter[%s],\n' +
        '   mongoDbUri[%s], mongoDbDatabase[%s],\n' +
        '   mySqlHost[%s], mySqlPort[%d], mySqlDatabase[%s], mySqlUser[%s], mySqlPassword[%s],\n' +
        '   oracleConnectString[%s], oracleUser[%s], oraclePassword[%s],\n' +
        '   postgresqlHost[%s], postgresqlPort[%d], postgresqlDatabase[%s], postgresqlUser[%s], postgresqlPassword[%s],\n' +
        '   redisUrl[%s],\n' +
        '   sqlServerHost[%s], sqlServerPort[%d], sqlServerDatabase[%s], sqlServerUser[%s], sqlServerPassword[%s]',
        config.port,
        config.cassandraHost, config.cassandraLocalDataCenter,
        config.mongoDbUri, config.mongoDbDatabase,
        config.mySqlHost, config.mySqlPort, config.mySqlDatabase, config.mySqlUser, config.mySqlPassword,
        config.oracleConnectString, config.oracleUser, config.oraclePassword,
        config.postgreSqlHost, config.postgreSqlPort, config.postgreSqlDatabase, config.postgreSqlUser, config.postgreSqlPassword,
        config.redisUrl,
        config.sqlServerHost, config.sqlServerPort, config.sqlServerDatabase, config.sqlServerUser, config.sqlServerPassword
      );
    }
    if (true || flag) {
      try {
        console.log('Aaa.aaa(): %s==============================%s', colors.WHITE_BRIGHT + colors.BG_RED, colors.RESET);
        await this.cassandraInitialization.loadInitialData(initArray);
        await this.cassandraDepartmentRepository.createDepartment(department);
        const resultArray: Department[] = await this.cassandraDepartmentRepository.getDepartments();
        console.log('Aaa.aaa(): %sCassandra%s resultArray departments.length[%d],\n' +
          '\tdep name[%s], emp length[%d], emp lastName[%s]\n' +
          '\tdep name[%s], emp length[%d], emp lastName[%s]',
          colors.WHITE_BRIGHT + colors.BG_RED, colors.RESET,
          resultArray.length,
          resultArray[0].name, resultArray[0].employees.length, resultArray[0].employees.length > 0 ? resultArray[0].employees[0].lastName : '',
          resultArray[1].name, resultArray[1].employees.length, resultArray[1].employees.length > 0 ? resultArray[1].employees[0].lastName : '');
      } catch (err) {
        console.error('Aaa.aaa():', err);
      }
    }
    if (flag) {
      try {
        console.log('Aaa.aaa(): %s==============================%s', colors.WHITE_BRIGHT + colors.BG_GREEN, colors.RESET);
        await this.mongoDbInitialization.loadInitialData(initArray);
        await this.mongoDbDepartmentRepository.createDepartment(department);
        const resultArray: Department[] = await this.mongoDbDepartmentRepository.getDepartments();
        console.log('Aaa.aaa(): %sMongoDB%s resultArray departments.length[%d],\n' +
          '\tdep name[%s], emp length[%d], emp lastName[%s]\n' +
          '\tdep name[%s], emp length[%d], emp lastName[%s]',
          colors.WHITE_BRIGHT + colors.BG_GREEN, colors.RESET,
          resultArray.length,
          resultArray[0].name, resultArray[0].employees.length, resultArray[0].employees.length > 0 ? resultArray[0].employees[0].lastName : '',
          resultArray[1].name, resultArray[1].employees.length, resultArray[1].employees.length > 0 ? resultArray[1].employees[0].lastName : '');
      } catch (err) {
        console.error('Aaa.aaa():', err);
      }
    }
    if (flag) {
      try {
        console.log('Aaa.aaa(): %s==============================%s', colors.CYAN_BRIGHT, colors.RESET);
        await this.mySqlInitialization.loadInitialData(initArray);
        await this.mySqlDepartmentRepository.createDepartment(department);
        const resultArray: Department[] = await this.mySqlDepartmentRepository.getDepartments();
        console.log('Aaa.aaa(): %sMySQL%s resultArray departments.length[%d],\n' +
          '\t1 dep name[%s], 1 emp lastName[%s]\n' +
          '\t2 dep name[%s], 2 emp length[%d]',
          colors.CYAN_BRIGHT, colors.RESET,
          resultArray.length, resultArray[0].name, resultArray[0].employees[0].lastName,
          resultArray[1].name, resultArray[1].employees.length);
      } catch (err) {
        console.error('Aaa.aaa():', err);
      }
    }
    if (flag) {
      try {
        console.log('Aaa.aaa(): %s==============================%s', colors.RED_BRIGHT, colors.RESET);
        await this.postgreSQLInitialization.loadInitialData(initArray);
        await this.postgreSQLDepartmentRepository.createDepartment(department);
        const resultArray: Department[] = await this.postgreSQLDepartmentRepository.getDepartments();
        console.log('Aaa.aaa(): %sPostgreSQL%s resultArray departments.length[%d],\n' +
          '\t1 dep name[%s], 1 emp lastName[%s]\n' +
          '\t2 dep name[%s], 2 emp length[%d]',
          colors.RED_BRIGHT, colors.RESET,
          resultArray.length, resultArray[0].name, resultArray[0].employees[0].lastName,
          resultArray[1].name, resultArray[1].employees.length);
      } catch (err) {
        console.error('Aaa.aaa():', err);
      }
    }
    if (flag) {
      try {
        console.log('Aaa.aaa(): %s==============================%s', colors.MAGENTA_BRIGHT, colors.RESET);
        await this.oracleInitialization.loadInitialData(initArray);
        await this.oracleDepartmentRepository.createDepartment(department);
        const resultArray: Department[] = await this.oracleDepartmentRepository.getDepartments();
        console.log('Aaa.aaa(): %sOracle%s resultArray departments.length[%d],\n' +
          '\t1 dep name[%s], 1 emp lastName[%s]\n' +
          '\t2 dep name[%s], 2 emp length[%d]',
          colors.MAGENTA_BRIGHT, colors.RESET,
          resultArray.length, resultArray[0].name, resultArray[0].employees[0].lastName,
          resultArray[1].name, resultArray[1].employees.length);
      } catch (err) {
        console.error('Aaa.aaa():', err);
      }
    }
    if (flag) {
      try {
        console.log('Aaa.aaa(): %s==============================%s', colors.YELLOW_BRIGHT, colors.RESET);
        await this.redisInitialization.loadInitialData(initArray);
        await this.redisDepartmentRepository.createDepartment(department);
        const resultArray: Department[] = await this.redisDepartmentRepository.getDepartments();
        console.log('Aaa.aaa(): %sRedis%s resultArray departments.length[%d],\n' +
          '\tdep name[%s], emp length[%d], emp lastName[%s]\n' +
          '\tdep name[%s], emp length[%d], emp lastName[%s]',
          colors.YELLOW_BRIGHT, colors.RESET,
          resultArray.length,
          resultArray[0].name, resultArray[0].employees.length, resultArray[0].employees.length > 0 ? resultArray[0].employees[0].lastName : '',
          resultArray[1].name, resultArray[1].employees.length, resultArray[1].employees.length > 0 ? resultArray[1].employees[0].lastName : '');
      } catch (err) {
        console.error('Aaa.aaa():', err);
      }
    }
    if (flag) {
      try {
        console.log('Aaa.aaa(): %s==============================%s', colors.GREEN_BRIGHT, colors.RESET);
        await this.sqlServerInitialization.loadInitialData(initArray);
        await this.sqlServerDepartmentRepository.createDepartment(department);
        const resultArray: Department[] = await this.sqlServerDepartmentRepository.getDepartments();
        console.log('Aaa.aaa(): %sSQL Server%s resultArray departments.length[%d],\n' +
          '\t1 dep name[%s], 1 emp lastName[%s]\n' +
          '\t2 dep name[%s], 2 emp length[%d]',
          colors.GREEN_BRIGHT, colors.RESET,
          resultArray.length, resultArray[0].name, resultArray[0].employees[0].lastName,
          resultArray[1].name, resultArray[1].employees.length);
      } catch (err) {
        console.error('Aaa.aaa():', err);
      }
    }
  }
}

const DEPARTMENTS_DATA_1 = `
{
  "departments": [
    {
      "id": 1,
      "name": "1st Front Office",
      "keywords": ["Banking"],
      "notes": "This office includes:\\n - corporate finance\\n - sales personnel",
      "startDate": "2020-01-20T00:00:00.000Z",
      "endDate": "2020-02-14T00:00:00.000Z",
      "image": "images/CommercialBuilding01.jpg",
      "employees": [
        {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe",
          "title": "Manager",
          "phone": "+1 202-555-0121",
          "mail": "John.Doe@example.com",
          "streetName": "Pennsylvania Ave NW",
          "houseNumber": "1600",
          "postalCode": "20500",
          "locality": "Washington",
          "province": "DC",
          "country": "United States"
        }
      ]
    }
  ]
}
`;
const DEPARTMENTS_DATA_2 = `
{
    "id": 12345,
    "name": "D-Name-CREATE",
    "keywords": [
        "Banking"
    ],
    "notes": "Test note",
    "startDate": "2020-01-20T00:00:00.000Z",
    "endDate": "2020-02-14T00:00:00.000Z",
    "image": "images/building.jpg",
    "employees": [
    ]
}
`;
