import { Employee } from "../models/employee.js";
import { PostgreSQLEmployeeRepository } from "../repositories/postgresql.employee.repository.js";

/**
 * This service class provides methods to manage employees.
 * It includes methods to get, set, create, update, and delete employees.
 */
export class EmployeeService {
	postgreSQLEmployeeRepository: PostgreSQLEmployeeRepository = new PostgreSQLEmployeeRepository();
	
    /**
     * Creates a new employee in the specified department.
     * @param departmentId the department id
     * @param employee the employee to create
     * @return void
     */
    async createEmployee(departmentId: number, employee: Employee) {
		await this.postgreSQLEmployeeRepository.createEmployee(departmentId, employee);
    }
    /**
     * Gets the employees.
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
     * Gets a specific employee by id from a department.
     * @param departmentId the department id
     * @param id the employee id
     * @return the employee with the specified id, or undefined if not found
     */
    async getEmployee(departmentId: number, id: number): Promise<Employee | undefined> {
        return await this.postgreSQLEmployeeRepository.getEmployee(departmentId, id);
    }
    /**
     * Updates an existing employee.
     * @param departmentId the department id
     * @param employee the employee to update
     * @return void
     */
    async updateEmployee(departmentId: number, employee: Employee) {
		await this.postgreSQLEmployeeRepository.updateEmployee(departmentId, employee);
	}
    /**
     * Deletes an employee  from the specified department by its id.
     * @param departmentId the department id
     * @param id the employee id
     * @return void
     */
    async deleteEmployee(departmentId: number, id: number) {
        await this.postgreSQLEmployeeRepository.deleteEmployee(departmentId, id);
    }
}
