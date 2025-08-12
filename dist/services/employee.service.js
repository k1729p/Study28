import { PostgreSQLEmployeeRepository } from "../repositories/postgresql/postgresql.employee.repository.js";
/**
 * This service class provides methods to manage employees.
 * It includes methods to get, set, create, update, and delete employees.
 */
export class EmployeeService {
    postgreSQLEmployeeRepository = new PostgreSQLEmployeeRepository();
    /**
     * Creates a new employee in the specified department.
     * @param employee the employee to create
     * @return void
     */
    async createEmployee(employee) {
        await this.postgreSQLEmployeeRepository.createEmployee(employee);
    }
    /**
     * Gets all employees.
     * @returns an array of Employee objects
     */
    async getEmployees() {
        return await this.postgreSQLEmployeeRepository.getEmployees();
    }
    /**
     * Gets the employees for a specific department.
     * @param departmentId the department id
     * @returns an array of employees for the specified department
     */
    async getEmployeesByDepartmentId(departmentId) {
        return await this.postgreSQLEmployeeRepository.getEmployeesByDepartmentId(departmentId);
    }
    /**
     * Gets a specific employee by its id.
     * @param id the employee id
     * @return the employee with the specified id, or undefined if not found
     */
    async getEmployee(id) {
        return await this.postgreSQLEmployeeRepository.getEmployee(id);
    }
    /**
     * Updates an existing employee.
     * @param employee the employee to update
     * @return void
     */
    async updateEmployee(employee) {
        await this.postgreSQLEmployeeRepository.updateEmployee(employee);
    }
    /**
     * Deletes an employee by its id.
     * @param id the employee id
     * @return void
     */
    async deleteEmployee(id) {
        await this.postgreSQLEmployeeRepository.deleteEmployee(id);
    }
}
