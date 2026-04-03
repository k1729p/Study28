import { Request, Response, NextFunction } from 'express';
import { Department } from "../models/department.js";
import { PostgreSQLInitialization } from "../repositories/postgresql/postgresql.initialization.js";
import { PostgreSQLDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";
import { SQLServerInitialization } from "../repositories/sql-server/sql-server.initialization.js";
import { SQLServerDepartmentRepository } from "../repositories/sql-server/sql-server.department.repository.js";
import { MySQLInitialization } from "../repositories/mysql/mysql.initialization.js";
import { MySQLDepartmentRepository } from "../repositories/mysql/mysql.department.repository.js";
import { OracleInitialization } from "../repositories/oracle/oracle.initialization.js";
import { OracleDepartmentRepository } from "../repositories/oracle/oracle.department.repository.js";
import { RedisInitialization } from "../repositories/redis/redis.initialization.js";
import { RedisDepartmentRepository } from "../repositories/redis/redis.department.repository.js";

import { config as config } from "../configuration/configuration.js";

export class Aaa {
  postgreSQLInitialization: PostgreSQLInitialization = new PostgreSQLInitialization();
  postgreSQLDepartmentRepository: PostgreSQLDepartmentRepository = new PostgreSQLDepartmentRepository();
  sqlServerInitialization: SQLServerInitialization = new SQLServerInitialization();
  sqlServerDepartmentRepository: SQLServerDepartmentRepository = new SQLServerDepartmentRepository();
  mySQLInitialization: MySQLInitialization = new MySQLInitialization();
  mySQLDepartmentRepository: MySQLDepartmentRepository = new MySQLDepartmentRepository();
  oracleInitialization: OracleInitialization = new OracleInitialization();
  oracleDepartmentRepository: OracleDepartmentRepository = new OracleDepartmentRepository();
  redisInitialization: RedisInitialization = new RedisInitialization();
  redisDepartmentRepository: RedisDepartmentRepository = new RedisDepartmentRepository();

  aaa = async (req: Request, res: Response, next: NextFunction) => {
    // console.log('Aaa.aaa(): port[%d], host[%s], pgPort[%d], pgDatabase[%s], pgUser[%s], pgPassword[%s], mongoDbUri[%s], mongoDbDatabase[%s]',
    //   config.port, config.host, config.pgPort, config.pgDatabase, config.pgUser, config.pgPassword, config.mongoDbUri, config.mongoDbDatabase
    // );
    const initArray: Department[] = JSON.parse(DEPARTMENTS_DATA_1).departments;
    const department: Department = JSON.parse(DEPARTMENTS_DATA_2);

    const flag = true;
    if (flag) {
      await this.postgreSQLInitialization.loadInitialData(initArray);
      await this.postgreSQLDepartmentRepository.createDepartment(department);
      const resultArray: Department[] = await this.postgreSQLDepartmentRepository.getDepartments();
      console.log('Aaa.aaa(): PostgreSQL resultArray departments.length[%d],\n' +
        '\t1 dep name[%s], 1 emp lastName[%s]\n' +
        '\t2 dep name[%s], 2 emp length[%d]',
        resultArray.length, resultArray[0].name, resultArray[0].employees[0].lastName,
        resultArray[1].name, resultArray[1].employees.length);
    }
    if (flag) {
      await this.sqlServerInitialization.loadInitialData(initArray);
      await this.sqlServerDepartmentRepository.createDepartment(department);
      const resultArray: Department[] = await this.sqlServerDepartmentRepository.getDepartments();
      console.log('Aaa.aaa(): SQL Server resultArray departments.length[%d],\n' +
        '\t1 dep name[%s], 1 emp lastName[%s]\n' +
        '\t2 dep name[%s], 2 emp length[%d]',
        resultArray.length, resultArray[0].name, resultArray[0].employees[0].lastName,
        resultArray[1].name, resultArray[1].employees.length);
    }
    if (flag) {
      await this.mySQLInitialization.loadInitialData(initArray);
      await this.mySQLDepartmentRepository.createDepartment(department);
      const resultArray: Department[] = await this.mySQLDepartmentRepository.getDepartments();
      console.log('Aaa.aaa(): MySQL resultArray departments.length[%d],\n' +
        '\t1 dep name[%s], 1 emp lastName[%s]\n' +
        '\t2 dep name[%s], 2 emp length[%d]',
        resultArray.length, resultArray[0].name, resultArray[0].employees[0].lastName,
        resultArray[1].name, resultArray[1].employees.length);
    }
    if (flag) {
      await this.oracleInitialization.loadInitialData(initArray);
      await this.oracleDepartmentRepository.createDepartment(department);
      const resultArray: Department[] = await this.mySQLDepartmentRepository.getDepartments();
      console.log('Aaa.aaa(): Oracle resultArray departments.length[%d],\n' +
        '\t1 dep name[%s], 1 emp lastName[%s]\n' +
        '\t2 dep name[%s], 2 emp length[%d]',
        resultArray.length, resultArray[0].name, resultArray[0].employees[0].lastName,
        resultArray[1].name, resultArray[1].employees.length);
    }
    if (flag) {
      await this.redisInitialization.loadInitialData(initArray);
      await this.redisDepartmentRepository.createDepartment(department);
      const resultArray: Department[] = await this.mySQLDepartmentRepository.getDepartments();
      console.log('Aaa.aaa(): Redis resultArray departments.length[%d],\n' +
        '\t1 dep name[%s], 1 emp lastName[%s]\n' +
        '\t2 dep name[%s], 2 emp length[%d]',
        resultArray.length, resultArray[0].name, resultArray[0].employees[0].lastName,
        resultArray[1].name, resultArray[1].employees.length);
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
