import { Employee } from "../models/employee.js";
import { PostgreSQLEmployeeRepository } from "../repositories/postgresql/postgresql.employee.repository.js";

/**
 * This service class provides methods to manage employees.
 * It includes methods to get, set, create, update, and delete employees.
 */
export class EmployeeService {
    postgreSQLEmployeeRepository: PostgreSQLEmployeeRepository = new PostgreSQLEmployeeRepository();

    /**
     * Creates a new employee in the specified department.
     * @param employee the employee to create
     * @return void
     */
    async createEmployee(employee: Employee) {
        await this.postgreSQLEmployeeRepository.createEmployee(employee);
    }
    /**
     * Gets all employees.
     * @returns an array of Employee objects
     */
    async getEmployees(): Promise<Employee[]> {
        return await this.postgreSQLEmployeeRepository.getEmployees();
    }

    /**
     * Gets the employees for a specific department.
     * @param departmentId the department id
     * @returns an array of employees for the specified department
     */
    async getEmployeesByDepartmentId(departmentId: number): Promise<Employee[] | undefined> {
        return await this.postgreSQLEmployeeRepository.getEmployeesByDepartmentId(departmentId);
    }
    /**
     * Gets a specific employee by its id.
     * @param id the employee id
     * @return the employee with the specified id, or undefined if not found
     */
    async getEmployee(id: number): Promise<Employee | undefined> {
        return await this.postgreSQLEmployeeRepository.getEmployee(id);
    }
    /**
     * Updates an existing employee.
     * @param employee the employee to update
     * @return void
     */
    async updateEmployee(employee: Employee) {
        await this.postgreSQLEmployeeRepository.updateEmployee(employee);
    }
    /**
     * Deletes an employee by its id.
     * @param id the employee id
     * @return void
     */
    async deleteEmployee(id: number) {
        await this.postgreSQLEmployeeRepository.deleteEmployee(id);
    }
}
