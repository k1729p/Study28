import { Department } from "../models/department.js";
import { Employee } from "../models/employee.js";
import { RepositoryType } from "../repositories/repository-type.js";
import { CassandraDepartmentRepository } from "../repositories/cassandra/cassandra.department.repository.js";
import { MongoDbDepartmentRepository } from "../repositories/mongodb/mongodb.department.repository.js";
import { MongoDbEmployeeRepository } from "../repositories/mongodb/mongodb.employee.repository.js";
import { MySqlDepartmentRepository } from "../repositories/mysql/mysql.department.repository.js";
import { OracleDepartmentRepository } from "../repositories/oracle/oracle.department.repository.js";
import { PostgreSQLDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";
import { RedisDepartmentRepository } from "../repositories/redis/redis.department.repository.js";
import { SQLServerDepartmentRepository } from "../repositories/sql-server/sql-server.department.repository.js";

/**
 * This service class provides methods to manage departments.
 * It includes methods to get, set, create, update, and delete departments.
 */
export class DepartmentService {
  cassandraDepartmentRepository: CassandraDepartmentRepository = new CassandraDepartmentRepository();
  mongoDbDepartmentRepository: MongoDbDepartmentRepository = new MongoDbDepartmentRepository();
  mongoDbEmployeeRepository: MongoDbEmployeeRepository = new MongoDbEmployeeRepository();
  mySqlDepartmentRepository: MySqlDepartmentRepository = new MySqlDepartmentRepository();
  oracleDepartmentRepository: OracleDepartmentRepository = new OracleDepartmentRepository();
  postgreSQLDepartmentRepository: PostgreSQLDepartmentRepository = new PostgreSQLDepartmentRepository();
  sqlServerDepartmentRepository: SQLServerDepartmentRepository = new SQLServerDepartmentRepository();
  redisDepartmentRepository: RedisDepartmentRepository = new RedisDepartmentRepository();
  /**
   * Creates a new department.
   * @param repositoryType the type of repository to use
   * @param department the department to be created
   * @return void
   */
  async createDepartment(repositoryType: RepositoryType, department: Department) {
    switch (repositoryType) {
      case RepositoryType.Cassandra:
        await this.cassandraDepartmentRepository.createDepartment(department);
        break;
      case RepositoryType.Chroma:
        break;
      case RepositoryType.Elasticsearch:
        break;
      case RepositoryType.MongoDB:
        await this.mongoDbDepartmentRepository.createDepartment(department);
        break;
      case RepositoryType.MySQL:
        await this.mySqlDepartmentRepository.createDepartment(department);
        break;
      case RepositoryType.Neo4j:
        break;
      case RepositoryType.Oracle:
        await this.oracleDepartmentRepository.createDepartment(department);
        break;
      case RepositoryType.PostgreSQL:
        await this.postgreSQLDepartmentRepository.createDepartment(department);
        break;
      case RepositoryType.Redis:
        await this.redisDepartmentRepository.createDepartment(department);
        break;
      case RepositoryType.SQLServer:
        await this.sqlServerDepartmentRepository.createDepartment(department);
        break;
    }
  }
  /**
   * Gets the departments.
   * @param repositoryType the type of repository to use
   * @returns an array of Department objects
   */
  async getDepartments(repositoryType: RepositoryType): Promise<Department[]> {
    switch (repositoryType) {
      case RepositoryType.Cassandra:
        return await this.cassandraDepartmentRepository.getDepartments();
      case RepositoryType.Chroma:
        return [];
      case RepositoryType.Elasticsearch:
        return [];
      case RepositoryType.MongoDB:
        const departments: Department[] = await this.mongoDbDepartmentRepository.getDepartments();
        for (const department of departments) {
          const employees: Employee[] = await this.mongoDbEmployeeRepository.getEmployees(department.id);
          department.employees = employees;
        }
        return departments;
      case RepositoryType.MySQL:
        return await this.mySqlDepartmentRepository.getDepartments();
      case RepositoryType.Neo4j:
        return [];
      case RepositoryType.Oracle:
        return await this.oracleDepartmentRepository.getDepartments();
      case RepositoryType.PostgreSQL:
        return await this.postgreSQLDepartmentRepository.getDepartments();
      case RepositoryType.Redis:
        return await this.redisDepartmentRepository.getDepartments();
      case RepositoryType.SQLServer:
        return await this.sqlServerDepartmentRepository.getDepartments();
    }
  }
  /**
   * Gets the department by id.
   * @param repositoryType the type of repository to use
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  async getDepartment(repositoryType: RepositoryType, id: number): Promise<Department | undefined> {
    switch (repositoryType) {
      case RepositoryType.MongoDB:
        console.error("DepartmentService.getDepartment(): case not implemented");
        return undefined;
      case RepositoryType.PostgreSQL:
      default:
        return await this.postgreSQLDepartmentRepository.getDepartment(id);
    }
  }
  /**
   * Updates an existing department.
   * @param repositoryType the type of repository to use
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(repositoryType: RepositoryType, department: Department) {
    switch (repositoryType) {
      case RepositoryType.MongoDB:
        await this.mongoDbDepartmentRepository.updateDepartment(department);
        break;
      case RepositoryType.PostgreSQL:
      default:
        await this.postgreSQLDepartmentRepository.updateDepartment(department);
        break;
    }
  }
  /**
   * Deletes a department by its id.
   *
   * @param repositoryType the type of repository to use
   * @param id the id of the department to be deleted
   * @returns void
   */
  async deleteDepartment(repositoryType: RepositoryType, id: number) {
    switch (repositoryType) {
      case RepositoryType.MongoDB:
        const employees: Employee[] = await this.mongoDbEmployeeRepository.getEmployees(id);
        for (const employee of employees) {
          await this.mongoDbEmployeeRepository.deleteEmployee(employee.id);
        }
        await this.mongoDbDepartmentRepository.deleteDepartment(id);
        break;
      case RepositoryType.PostgreSQL:
      default:
        await this.postgreSQLDepartmentRepository.deleteDepartment(id);
        break;
    }
  }
}