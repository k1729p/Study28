import { StatusCodes } from 'http-status-codes';
import { EmployeeService } from "../services/employee.service.js";
import { RepositoryType } from '../repositories/repository-type.js';
import { RED_BRIGHT, CYAN_BRIGHT, MAGENTA_BRIGHT, RESET } from "../colors.js";
/**
 * This service class provides methods to manage employees.
 */
export class EmployeeController {
    employeeService = new EmployeeService();
    /**
     * Create a new employee.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    createEmployee = async (req, res, next) => {
        const repositoryType = req.query.repositoryType || RepositoryType.PostgreSQL;
        const employee = req.body;
        if (!employee || !employee.id) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
            console.error("EmployeeController.createEmployee(): invalid employee id");
            return;
        }
        try {
            await this.employeeService.createEmployee(repositoryType, employee);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.createEmployee():", error);
            return;
        }
        res.status(StatusCodes.CREATED).json();
        console.log("%sEmployeeController.createEmployee():%s repositoryType[%s], id[%s]", RED_BRIGHT, RESET, repositoryType, employee.id);
    };
    /**
     * Get all employees.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    getEmployees = async (req, res, next) => {
        const repositoryType = req.query.repositoryType || RepositoryType.PostgreSQL;
        try {
            const employeeArray = await this.employeeService.getEmployees(repositoryType);
            res.status(StatusCodes.OK).json(employeeArray);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.getEmployees():", error);
            return;
        }
        console.log("EmployeeController.getEmployees(): repositoryType[%s]", repositoryType);
    };
    /**
     * Get a employee by ID.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    getEmployeeById = async (req, res, next) => {
        const repositoryType = req.query.repositoryType || RepositoryType.PostgreSQL;
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
            console.error("EmployeeController.getEmployeeById(): invalid employee id");
            return;
        }
        try {
            const employee = await this.employeeService.getEmployee(repositoryType, id);
            if (!employee) {
                res.status(StatusCodes.NOT_FOUND).json({ message: 'Employee not found' });
                console.log("EmployeeController.getEmployeeById(): employee not found, id[%s]", id);
                return;
            }
            res.status(StatusCodes.OK).json(employee);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.getEmployeeById():", error);
            return;
        }
        console.log("EmployeeController.getEmployeeById(): repositoryType[%s], id[%s]", repositoryType, id);
    };
    /**
     * Update a employee.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    updateEmployee = async (req, res, next) => {
        const repositoryType = req.query.repositoryType || RepositoryType.PostgreSQL;
        const employee = req.body;
        if (!employee || !employee.id) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
            console.error("EmployeeController.updateEmployee(): invalid employee id");
            return;
        }
        try {
            await this.employeeService.updateEmployee(repositoryType, employee);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.updateEmployee():", error);
            return;
        }
        res.status(StatusCodes.NO_CONTENT).json();
        console.log("%sEmployeeController.updateDepartment():%s repositoryType[%s], id[%s]", MAGENTA_BRIGHT, RESET, repositoryType, employee.id);
    };
    /**
     * Delete a employee.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    deleteEmployee = async (req, res, next) => {
        const repositoryType = req.query.repositoryType || RepositoryType.PostgreSQL;
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
            console.error("EmployeeController.deleteEmployee(): invalid employee id");
            return;
        }
        try {
            await this.employeeService.deleteEmployee(repositoryType, id);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.deleteEmployee():", error);
        }
        res.status(StatusCodes.NO_CONTENT).json();
        console.log("%sEmployeeController.deleteDepartment():%s repositoryType[%s], id[%s]", CYAN_BRIGHT, RESET, repositoryType, id);
    };
}
