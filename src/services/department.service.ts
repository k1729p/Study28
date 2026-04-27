import { Department } from "../models/department.js";
import { RepositoryType } from "../repositories/repository-type.js";
import { CassandraDepartmentRepository } from "../repositories/cassandra/cassandra.department.repository.js";
import { ElasticsearchDepartmentRepository } from "../repositories/elasticsearch/elasticsearch.department.repository.js";
import { MongoDbDepartmentRepository } from "../repositories/mongodb/mongodb.department.repository.js";
import { MongoDbEmployeeRepository } from "../repositories/mongodb/mongodb.employee.repository.js";
import { MySqlDepartmentRepository } from "../repositories/mysql/mysql.department.repository.js";
import { Neo4jDepartmentRepository } from "../repositories/neo4j/neo4j.department.repository.js";
import { OracleDepartmentRepository } from "../repositories/oracle/oracle.department.repository.js";
import { PostgreSQLDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";
import { RedisDepartmentRepository } from "../repositories/redis/redis.department.repository.js";
import { SQLServerDepartmentRepository } from "../repositories/sql-server/sql-server.department.repository.js";

/**
 * The  structural contract.
 */
export interface IDepartmentRepository {
  // Optional properties (?) allow WIP repositories to safely omit methods ???????????????
  createDepartment(department: Department): Promise<void>;
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  updateDepartment(department: Department): Promise<void>;
  deleteDepartment(id: number): Promise<void>;
}
/**
 * This service class provides methods to manage departments.
 * It includes methods to get, set, create, update, and delete departments.
 */
export class DepartmentService {

  private readonly strategies: Partial<Record<RepositoryType, IDepartmentRepository>>;
  constructor() {
    this.strategies = {
      [RepositoryType.Cassandra]: new CassandraDepartmentRepository(),
      [RepositoryType.Elasticsearch]: new ElasticsearchDepartmentRepository(),
      [RepositoryType.MongoDB]: new MongoDbDepartmentRepository(),
      [RepositoryType.MySQL]: new MySqlDepartmentRepository(),
      [RepositoryType.Neo4j]: new Neo4jDepartmentRepository(),
      [RepositoryType.Oracle]: new OracleDepartmentRepository(),
      [RepositoryType.PostgreSQL]: new PostgreSQLDepartmentRepository(),
      [RepositoryType.Redis]: new RedisDepartmentRepository(),
      [RepositoryType.SQLServer]: new SQLServerDepartmentRepository(),
    };
  }
  /**
   * Creates a new department.
   * @param repositoryType the type of repository to use
   * @param department the department to be created
   * @return void
   */
  async createDepartment(repositoryType: RepositoryType, department: Department): Promise<void> {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("DepartmentService.createDepartment(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    return await strategy.createDepartment(department);
  }
  /**
   * Gets the departments.
   * @param repositoryType the type of repository to use
   * @returns an array of Department objects
   */
  async getDepartments(repositoryType: RepositoryType): Promise<Department[]> {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("DepartmentService.getDepartments(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    return strategy.getDepartments();
  }
  /**
   * Gets the department by id.
   * @param repositoryType the type of repository to use
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  async getDepartment(repositoryType: RepositoryType, id: number): Promise<Department | undefined> {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("DepartmentService.getDepartment(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    return strategy.getDepartment(id);
  }
  /**
   * Updates an existing department.
   * @param repositoryType the type of repository to use
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(repositoryType: RepositoryType, department: Department) {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("DepartmentService.updateDepartment(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    await strategy.updateDepartment(department);
  }
  /**
   * Deletes a department by its id.
   *
   * @param repositoryType the type of repository to use
   * @param id the id of the department to be deleted
   * @returns void
   */
  async deleteDepartment(repositoryType: RepositoryType, id: number) {
    const strategy = this.strategies[repositoryType];
    if (strategy == undefined) {
      console.warn("DepartmentService.deleteDepartment(): not implemented strategy for [%s]", repositoryType);
      throw new ReferenceError(`Not implemented strategy for [${repositoryType}]`);
    }
    await strategy.deleteDepartment(id);
  }
}