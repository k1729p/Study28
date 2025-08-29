import { Department } from "../models/department.js";
import { RepositoryType } from "../repositories/repository-type.js";
import { PostgreSQLDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";

/**
 * This service class provides methods to manage departments.
 * It includes methods to get, set, create, update, and delete departments.
 */
export class DepartmentService {
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
                // await this.mongoDBRepository.createDepartment(department);
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
                // return await this.mongoDBRepository.getDepartments();
                return [];
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
                // return await this.mongoDBRepository.getDepartment(id);
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
                // await this.mongoDBRepository.updateDepartment(department);
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
                // await this.mongoDBRepository.deleteDepartment(id);
                break;
            case RepositoryType.PostgreSQL:
            default:
                await this.postgreSQLDepartmentRepository.deleteDepartment(id);
                break;
        }
    }
    /**
     * Transfers the employees from source department to target department.
     *
     * @param sourceDepartmentId the id of the source department
     * @param targetDepartmentId the id of the target department
     * @param employeeIds the transferred employees array
     * @returns void
     */
    async transferEmployees(repositoryType: RepositoryType,
        sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]) {
        switch (repositoryType) {
            case RepositoryType.MongoDB:
                // Implement MongoDB logic if necessary
                break;
            case RepositoryType.PostgreSQL:
            default:
                await this.postgreSQLDepartmentRepository.transferEmployees(
                    sourceDepartmentId, targetDepartmentId, employeeIds
                );
                break;
        }
    }    
}