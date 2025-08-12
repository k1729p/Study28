import { StatusCodes } from 'http-status-codes';
import { EmployeeService } from "../services/employee.service.js";
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
        const employee = req.body;
        if (!employee || !employee.id) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
            console.error("EmployeeController.createEmployee(): invalid employee id");
            return;
        }
        try {
            await this.employeeService.createEmployee(employee);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.createEmployee():", error);
            return;
        }
        res.status(StatusCodes.CREATED).json();
        console.log("EmployeeController.createEmployee(): id[%s]", employee.id);
    };
    /**
     * Get all employees.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    getEmployees = async (req, res, next) => {
        try {
            const employeeArray = await this.employeeService.getEmployees();
            res.status(StatusCodes.OK).json(employeeArray);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.getEmployees():", error);
            return;
        }
        console.log("EmployeeController.getEmployees():");
    };
    /**
     * Get employees by department ID.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    getEmployeesByDepartmentId = async (req, res, next) => {
        const departmentId = parseInt(req.params.id);
        if (isNaN(departmentId)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
            console.error("EmployeeController.getEmployeesByDepartmentId(): invalid department id");
            return;
        }
        try {
            const employeeArray = await this.employeeService.getEmployeesByDepartmentId(departmentId);
            res.status(StatusCodes.OK).json(employeeArray);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.getEmployeesByDepartmentId():", error);
            return;
        }
        console.log("EmployeeController.getEmployeesByDepartmentId(): department id[%s]", departmentId);
    };
    /**
     * Get a employee by ID.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    getEmployeeById = async (req, res, next) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
            console.error("EmployeeController.getEmployeeById(): invalid employee id");
            return;
        }
        try {
            const employee = await this.employeeService.getEmployee(id);
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
        console.log("EmployeeController.getEmployeeById(): id[%s]", id);
    };
    /**
     * Update a employee.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    updateEmployee = async (req, res, next) => {
        const employee = req.body;
        if (!employee || !employee.id) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
            console.error("EmployeeController.updateEmployee(): invalid employee id");
            return;
        }
        try {
            await this.employeeService.updateEmployee(employee);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.updateEmployee():", error);
            return;
        }
        res.status(StatusCodes.NO_CONTENT).json();
        console.log("EmployeeController.updateEmployee(): id[%s]", employee.id);
    };
    /**
     * Delete a employee.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    deleteEmployee = async (req, res, next) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
            console.error("EmployeeController.deleteEmployee(): invalid employee id");
            return;
        }
        try {
            await this.employeeService.deleteEmployee(id);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.deleteEmployee():", error);
        }
        res.status(StatusCodes.NO_CONTENT).json();
        console.log("EmployeeController.deleteEmployee(): id[%s]", id);
    };
}
