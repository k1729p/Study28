import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { RepositoryType } from '../repositories/repository-type.js';
import { Department } from "../models/department.js";
import { InitializationService } from "../services/initialization.service.js";
import { DepartmentService } from "../services/department.service.js";
import * as colors from "../utils/styledColors.js";
import { config as config } from "../configuration/configuration.js";

import { Bbb } from "./bbb.js";

const REPOSITORY_TYPES = [
  RepositoryType.Cassandra,
  RepositoryType.Elasticsearch,
  RepositoryType.MongoDB,
  RepositoryType.MySQL,
  RepositoryType.Oracle,
  RepositoryType.PostgreSQL,
  RepositoryType.Redis,
  RepositoryType.SQLServer,
];
/**
 * 
 */
export class Aaa {
  initializationService: InitializationService = new InitializationService();
  departmentService: DepartmentService = new DepartmentService();
  /**
   * 
   * @param req 
   * @param res 
   * @param next 
   */
  initialize = async (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json('OK OK OK OK OK OK OK OK OK OK OK');
    console.log('Aaa.initialize(): port[%d],\n' +
      '   cassandraHost[%s], cassandraLocalDataCenter[%s],\n' +
      '   elasticsearchHost[%s], elasticsearchPort[%d],\n' +
      '   mongoDbHost[%s], mongoDbPort[%d], mongoDbDatabase[%s],\n' +
      '   mySqlHost[%s], mySqlPort[%d], mySqlDatabase[%s], mySqlUser[%s], mySqlPassword[%s],\n' +
      '   oracleHost[%s], oraclePort[%d], oracleUser[%s], oraclePassword[%s],\n' +
      '   postgresqlHost[%s], postgresqlPort[%d], postgresqlDatabase[%s], postgresqlUser[%s], postgresqlPassword[%s],\n' +
      '   redisHost[%s], redisPort[%d], ,\n' +
      '   sqlServerHost[%s], sqlServerPort[%d], sqlServerDatabase[%s], sqlServerUser[%s], sqlServerPassword[%s]',
      config.port,
      config.cassandraHost, config.cassandraLocalDataCenter,
      config.elasticsearchHost, config.elasticsearchPort,
      config.mongoDbHost, config.mongoDbPort, config.mongoDbDatabase,
      config.mySqlHost, config.mySqlPort, config.mySqlDatabase, config.mySqlUser, config.mySqlPassword,
      config.oracleHost, config.oraclePort, config.oracleUser, config.oraclePassword,
      config.postgreSqlHost, config.postgreSqlPort, config.postgreSqlDatabase, config.postgreSqlUser, config.postgreSqlPassword,
      config.redisHost, config.redisPort,
      config.sqlServerHost, config.sqlServerPort, config.sqlServerDatabase, config.sqlServerUser, config.sqlServerPassword
    );
    await this.process(true);
  }
  /**
   * 
   * @param req 
   * @param res 
   * @param next 
   */
  read = async (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json('OK OK OK OK OK OK OK OK OK OK OK');
    await this.process(false);
    if (false) {
      new Bbb().researchLogging();
      new Bbb().researchAsyncLocalStorage();
    }
  }
  /**
   * 
   * @param configFlag 
   * @param initializeFlag 
   * @param cassandraFlag 
   * @returns 
   */
  async process(initializeFlag: boolean) {
    const initializeDepartmentsInput: Department[] = [JSON.parse(INITIALIZE_DEPARTMENT_DATA)];
    const createDepartmentInput: Department = JSON.parse(CREATE_DEPARTMENT_DATA);
    for (const repositoryType of REPOSITORY_TYPES) {
      console.time(repositoryType);
      try {
        console.log('Aaa.process():', colors.repo[repositoryType]('='.repeat(50) + ' ' + repositoryType));
        if (initializeFlag) {
          await this.initializationService.loadInitialData(repositoryType, initializeDepartmentsInput);
          await this.departmentService.createDepartment(repositoryType, createDepartmentInput);
        }
        const departments = await this.departmentService.getDepartments(repositoryType);
        console.timeEnd(repositoryType);
        const employees0 = departments[0]?.employees ?? [];
        const employees1 = departments[1]?.employees ?? [];
        console.log('Aaa.process(): departments.length[%d],\n' +
          '\tdep name[%s], emp length[%d], emp lastName[%s]\n' +
          '\tdep name[%s], emp length[%d], emp lastName[%s]\n\t%s',
          departments.length,
          departments[0]?.name, employees0.length, employees0[0]?.lastName ?? '',
          departments[1]?.name, employees1.length, employees1[0]?.lastName ?? '',
          colors.repo[repositoryType]('^'.repeat(57) + ' ' + repositoryType));
      } catch (err) {
        console.error('Aaa.process():', err);
      }
    };
    console.log(colors.red('#####=====#####'), colors.green('#####=====#####'),
      colors.yellow('#####=====#####'), colors.cyan('#####=====#####'),
      colors.red('#####=====#####'), colors.green('#####=====#####'),
      colors.yellow('#####=====#####'), colors.cyan('#####=====#####')
    );
  };
}

const INITIALIZE_DEPARTMENT_DATA = `
{
  "id": 1,
  "name": "1st Front Office",
  "keywords": ["Banking"],
  "notes": "This office includes:\\n - corporate finance\\n - sales personnel",
  "startDate": "2020-01-20T00:00:00.000Z",
  "endDate": "2020-02-14T00:00:00.000Z",
  "image": "images/CommercialBuilding01.jpg",
  "employees": [{
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
  }]
}
`;
const CREATE_DEPARTMENT_DATA = `
{
  "id": 12345,
  "name": "D-Name-CREATE",
  "keywords": ["Banking"],
  "notes": "Test note",
  "startDate": "2020-01-20T00:00:00.000Z",
  "endDate": "2020-02-14T00:00:00.000Z",
  "image": "images/building.jpg",
  "employees": []
}
`;
