import { Department } from "../models/department.js";
import { PostgreSQLDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";

/**
 * This service class provides methods to manage departments.
 * It includes methods to get, set, create, update, and delete departments.
 */
export class DepartmentService {
    postgreSQLDepartmentRepository: PostgreSQLDepartmentRepository = new PostgreSQLDepartmentRepository();

    /**
     * Creates a new department.
     * @param department the department to be created
     * @return void
     */
    async createDepartment(department: Department) {
        await this.postgreSQLDepartmentRepository.createDepartment(department);
    }
    /**
     * Gets the departments.
     * @returns an array of Department objects
     */
    async getDepartments(): Promise<Department[]> {
        return await this.postgreSQLDepartmentRepository.getDepartments();
    }

    /**
     * Gets the department by id.
     * @param id the id of the department to retrieve
     * @returns the Department object if found, otherwise undefined
     */
    async getDepartment(id: number): Promise<Department | undefined> {
        return await this.postgreSQLDepartmentRepository.getDepartment(id);
    }
    /**
     * Updates an existing department.
     * @param department the department to be updated
     * @returns void
     */
    async updateDepartment(department: Department) {
        await this.postgreSQLDepartmentRepository.updateDepartment(department);
    }

    /**
     * Deletes a department by its id.
     *
     * @param id the id of the department to be deleted
     * @returns void
     */
    async deleteDepartment(id: number) {
        await this.postgreSQLDepartmentRepository.deleteDepartment(id);
    }
}