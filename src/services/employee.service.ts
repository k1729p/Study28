import { Employee } from "../models/employee.js";
import { RepositoryType } from "../repositories/repository-type.js";
import { EmployeeRepository } from "../repositories/employee.repository.js";
import { CassandraEmployeeRepository } from "../repositories/cassandra/cassandra.employee.repository.js";
import { ElasticsearchEmployeeRepository } from "../repositories/elasticsearch/elasticsearch.employee.repository.js";
import { MongoDbEmployeeRepository } from "../repositories/mongodb/mongodb.employee.repository.js";
import { MySqlEmployeeRepository } from "../repositories/mysql/mysql.employee.repository.js";
import { Neo4jEmployeeRepository } from "../repositories/neo4j/neo4j.employee.repository.js";
import { OracleEmployeeRepository } from "../repositories/oracle/oracle.employee.repository.js";
import { PostgreSQLEmployeeRepository } from "../repositories/postgresql/postgresql.employee.repository.js";
import { RedisEmployeeRepository } from "../repositories/redis/redis.employee.repository.js";
import { SQLServerEmployeeRepository } from "../repositories/sql-server/sql-server.employee.repository.js";

/**
 * This service class provides methods to manage employees.
 * It includes methods to get, set, create, update, and delete employees.
 */
export class EmployeeService {

  private readonly strategies: Partial<Record<RepositoryType, EmployeeRepository>>;
  /**
   * Initializes the service with available repository strategies.
   */  
  constructor() {
    this.strategies = {
      [RepositoryType.Cassandra]: new CassandraEmployeeRepository(),
      [RepositoryType.Elasticsearch]: new ElasticsearchEmployeeRepository(),
      [RepositoryType.MongoDB]: new MongoDbEmployeeRepository(),
      [RepositoryType.MySQL]: new MySqlEmployeeRepository(),
      [RepositoryType.Neo4j]: new Neo4jEmployeeRepository(),
      [RepositoryType.Oracle]: new OracleEmployeeRepository(),
      [RepositoryType.PostgreSQL]: new PostgreSQLEmployeeRepository(),
      [RepositoryType.Redis]: new RedisEmployeeRepository(),
      [RepositoryType.SQLServer]: new SQLServerEmployeeRepository(),
    };
  }
  /**
   * Creates a new employee in the specified department.
   * @param repositoryType the type of repository to use
   * @param employee the employee to create
   * @return void
   */
  async createEmployee(repositoryType: RepositoryType, employee: Employee) {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("EmployeeService.createEmployee(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    return await strategy.createEmployee(employee);
  }
  /**
   * Gets all employees.
   * @param repositoryType the type of repository to use
   * @returns an array of Employee objects
   */
  async getEmployees(repositoryType: RepositoryType,): Promise<Employee[]> {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("EmployeeService.getEmployees(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    return strategy.getEmployees();
  }

  /**
   * Gets a specific employee by its id.
   * @param repositoryType the type of repository to use
   * @param id the employee id
   * @return the employee with the specified id, or undefined if not found
   */
  async getEmployee(repositoryType: RepositoryType, id: number): Promise<Employee | undefined> {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("EmployeeService.getEmployee(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    return strategy.getEmployee(id);
  }
  /**
   * Updates an existing employee.
   * @param repositoryType the type of repository to use
   * @param employee the employee to update
   * @return void
   */
  async updateEmployee(repositoryType: RepositoryType, employee: Employee) {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("EmployeeService.updateEmployee(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    await strategy.updateEmployee(employee);
  }
  /**
   * Deletes an employee by its id.
   * @param id the employee id
   * @return void
   */
  async deleteEmployee(repositoryType: RepositoryType, id: number) {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("EmployeeService.deleteEmployee(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    await strategy.deleteEmployee(id);
  }
}
