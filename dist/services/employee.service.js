import { RepositoryType } from "../repositories/repository-type.js";
import { PostgreSQLEmployeeRepository } from "../repositories/postgresql/postgresql.employee.repository.js";
/**
 * This service class provides methods to manage employees.
 * It includes methods to get, set, create, update, and delete employees.
 */
export class EmployeeService {
    postgreSQLEmployeeRepository = new PostgreSQLEmployeeRepository();
    /**
     * Creates a new employee in the specified department.
     * @param repositoryType the type of repository to use
     * @param employee the employee to create
     * @return void
     */
    async createEmployee(repositoryType, employee) {
        switch (repositoryType) {
            case RepositoryType.MongoDB:
                break;
            case RepositoryType.PostgreSQL:
            default:
                await this.postgreSQLEmployeeRepository.createEmployee(employee);
                break;
        }
    }
    /**
     * Gets all employees.
     * @param repositoryType the type of repository to use
     * @returns an array of Employee objects
     */
    async getEmployees(repositoryType) {
        switch (repositoryType) {
            case RepositoryType.MongoDB:
                return [];
            case RepositoryType.PostgreSQL:
            default:
                return await this.postgreSQLEmployeeRepository.getEmployees();
        }
    }
    /**
     * Gets a specific employee by its id.
     * @param repositoryType the type of repository to use
     * @param id the employee id
     * @return the employee with the specified id, or undefined if not found
     */
    async getEmployee(repositoryType, id) {
        switch (repositoryType) {
            case RepositoryType.MongoDB:
                return undefined;
            case RepositoryType.PostgreSQL:
            default:
                return await this.postgreSQLEmployeeRepository.getEmployee(id);
        }
    }
    /**
     * Updates an existing employee.
     * @param repositoryType the type of repository to use
     * @param employee the employee to update
     * @return void
     */
    async updateEmployee(repositoryType, employee) {
        switch (repositoryType) {
            case RepositoryType.MongoDB:
                break;
            case RepositoryType.PostgreSQL:
            default:
                await this.postgreSQLEmployeeRepository.updateEmployee(employee);
                break;
        }
    }
    /**
     * Deletes an employee by its id.
     * @param id the employee id
     * @return void
     */
    async deleteEmployee(repositoryType, id) {
        switch (repositoryType) {
            case RepositoryType.MongoDB:
                break;
            case RepositoryType.PostgreSQL:
            default:
                await this.postgreSQLEmployeeRepository.deleteEmployee(id);
                break;
        }
    }
}
