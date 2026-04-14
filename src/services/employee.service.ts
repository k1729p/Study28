import { Employee } from "../models/employee.js";
import { RepositoryType } from "../repositories/repository-type.js";
import { MongoDbEmployeeRepository } from "../repositories/mongodb/mongodb.employee.repository.js";
import { PostgreSQLEmployeeRepository } from "../repositories/postgresql/postgresql.employee.repository.js";

/**
 * This service class provides methods to manage employees.
 * It includes methods to get, set, create, update, and delete employees.
 */
export class EmployeeService {
  mongoDbEmployeeRepository: MongoDbEmployeeRepository = new MongoDbEmployeeRepository();
  postgreSQLEmployeeRepository: PostgreSQLEmployeeRepository = new PostgreSQLEmployeeRepository();
  /**
   * Creates a new employee in the specified department.
   * @param repositoryType the type of repository to use
   * @param employee the employee to create
   * @return void
   */
  async createEmployee(repositoryType: RepositoryType, employee: Employee) {
    switch (repositoryType) {
      case RepositoryType.Cassandra:
        break;
      case RepositoryType.Chroma:
        break;
      case RepositoryType.Elasticsearch:
        break;
      case RepositoryType.MongoDB:
        await this.mongoDbEmployeeRepository.createEmployee(employee);
        break;
      case RepositoryType.MySQL:
        break;
      case RepositoryType.Neo4j:
        break;
      case RepositoryType.Oracle:
        break;
      case RepositoryType.PostgreSQL:
        await this.postgreSQLEmployeeRepository.createEmployee(employee);
        break;
      case RepositoryType.Redis:
        break;
      case RepositoryType.SQLServer:
        break;
    }
  }
  /**
   * Gets all employees.
   * @param repositoryType the type of repository to use
   * @returns an array of Employee objects
   */
  async getEmployees(repositoryType: RepositoryType,): Promise<Employee[]> {
    switch (repositoryType) {
      case RepositoryType.Cassandra:
        return [];
      case RepositoryType.Chroma:
        return [];
      case RepositoryType.Elasticsearch:
        return [];
      case RepositoryType.MongoDB:
        return await this.mongoDbEmployeeRepository.getEmployees();
      case RepositoryType.MySQL:
        return [];
      case RepositoryType.Neo4j:
        return [];
      case RepositoryType.Oracle:
        return [];
      case RepositoryType.PostgreSQL:
        return await this.postgreSQLEmployeeRepository.getEmployees();
      case RepositoryType.Redis:
        return [];
      case RepositoryType.SQLServer:
        return [];
    }
  }

  /**
   * Gets a specific employee by its id.
   * @param repositoryType the type of repository to use
   * @param id the employee id
   * @return the employee with the specified id, or undefined if not found
   */
  async getEmployee(repositoryType: RepositoryType, id: number): Promise<Employee | undefined> {
    switch (repositoryType) {
      case RepositoryType.Cassandra:
        return undefined;
      case RepositoryType.Chroma:
        return undefined;
      case RepositoryType.Elasticsearch:
        return undefined;
      case RepositoryType.MongoDB:
        return await this.mongoDbEmployeeRepository.getEmployee(id);
      case RepositoryType.MySQL:
        return undefined;
      case RepositoryType.Neo4j:
        return undefined;
      case RepositoryType.Oracle:
        return undefined;
      case RepositoryType.PostgreSQL:
        return await this.postgreSQLEmployeeRepository.getEmployee(id);
      case RepositoryType.Redis:
        return undefined;
      case RepositoryType.SQLServer:
        return undefined;
    }
  }
  /**
   * Updates an existing employee.
   * @param repositoryType the type of repository to use
   * @param employee the employee to update
   * @return void
   */
  async updateEmployee(repositoryType: RepositoryType, employee: Employee) {
    switch (repositoryType) {
      case RepositoryType.Cassandra:
        break;
      case RepositoryType.Chroma:
        break;
      case RepositoryType.Elasticsearch:
        break;
      case RepositoryType.MongoDB:
        await this.mongoDbEmployeeRepository.updateEmployee(employee);
        break;
      case RepositoryType.MySQL:
        break;
      case RepositoryType.Neo4j:
        break;
      case RepositoryType.Oracle:
        break;
      case RepositoryType.PostgreSQL:
        await this.postgreSQLEmployeeRepository.updateEmployee(employee);
        break;
      case RepositoryType.Redis:
        break;
      case RepositoryType.SQLServer:
        break;
    }
  }
  /**
   * Deletes an employee by its id.
   * @param id the employee id
   * @return void
   */
  async deleteEmployee(repositoryType: RepositoryType, id: number) {
    switch (repositoryType) {
      case RepositoryType.Cassandra:
        break;
      case RepositoryType.Chroma:
        break;
      case RepositoryType.Elasticsearch:
        break;
      case RepositoryType.MongoDB:
        await this.mongoDbEmployeeRepository.deleteEmployee(id);
        break;
      case RepositoryType.MySQL:
        break;
      case RepositoryType.Neo4j:
        break;
      case RepositoryType.Oracle:
        break;
      case RepositoryType.PostgreSQL:
        await this.postgreSQLEmployeeRepository.deleteEmployee(id);
        break;
      case RepositoryType.Redis:
        break;
      case RepositoryType.SQLServer:
        break;
    }
  }
}
