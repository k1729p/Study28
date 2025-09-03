import { Department } from "../models/department.js";
import { Employee } from "../models/employee.js";
import { RepositoryType } from "../repositories/repository-type.js";
import { MongoDbDepartmentRepository } from "../repositories/mongodb/mongodb.department.repository.js";
import { MongoDbEmployeeRepository } from "../repositories/mongodb/mongodb.employee.repository.js";
import { PostgreSQLDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";

/**
 * This service class provides methods to manage departments.
 * It includes methods to get, set, create, update, and delete departments.
 */
export class DepartmentService {
    mongoDbDepartmentRepository: MongoDbDepartmentRepository = new MongoDbDepartmentRepository();
    mongoDbEmployeeRepository: MongoDbEmployeeRepository = new MongoDbEmployeeRepository();
    postgreSQLDepartmentRepository: PostgreSQLDepartmentRepository = new PostgreSQLDepartmentRepository();
    /**
     * Creates a new department.
     * @param repositoryType the type of repository to use
     * @param department the department to be created
     * @return void
     */
    async createDepartment(repositoryType: RepositoryType, department: Department) {
        switch (repositoryType) {
            case RepositoryType.MongoDB:
                await this.mongoDbDepartmentRepository.createDepartment(department);
                break;
            case RepositoryType.PostgreSQL:
            default:
                await this.postgreSQLDepartmentRepository.createDepartment(department);
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
            case RepositoryType.MongoDB:
                const departments: Department[] = await this.mongoDbDepartmentRepository.getDepartments();
                for (const department of departments) {
                    const employees: Employee[] = await this.mongoDbEmployeeRepository.getEmployees(department.id);
                    department.employees = employees;
                }
                return departments;
            case RepositoryType.PostgreSQL:
            default:
                return await this.postgreSQLDepartmentRepository.getDepartments();
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