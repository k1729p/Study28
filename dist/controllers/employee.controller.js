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
        const departmentId = 1; //TODO
        const employee = req.body;
        try {
            await this.employeeService.createEmployee(departmentId, employee);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.createEmployee():", error);
            return;
        }
        res.status(201).json();
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
            res.status(200).json(employeeArray);
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
        const departmentId = 1; //TODO
        try {
            const employeeArray = await this.employeeService.getEmployeesByDepartmentId(departmentId);
            res.status(200).json(employeeArray);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.getEmployees():", error);
            return;
        }
        console.log("EmployeeController.getEmployees():");
    };
    /**
     * Get a employee by ID.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    getEmployeeById = async (req, res, next) => {
        const departmentId = 1; //TODO
        const id = parseInt(req.params.id, 10);
        try {
            const employee = await this.employeeService.getEmployee(departmentId, id);
            if (!employee) {
                res.status(404).json({ message: 'Employee not found' });
                console.log("EmployeeController.getEmployeeById(): employee not found, id[%s]", id);
                return;
            }
            res.status(200).json(employee);
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
        const departmentId = 1; //TODO
        const employee = req.body;
        try {
            await this.employeeService.updateEmployee(departmentId, employee);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.updateEmployee():", error);
            return;
        }
        res.status(204).json();
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
        const departmentId = 1; //TODO
        try {
            const id = parseInt(req.params.id, 10);
            await this.employeeService.deleteEmployee(departmentId, id);
            res.status(204).json();
            console.log("EmployeeController.deleteEmployee(): id[%s]", id);
        }
        catch (error) {
            next(error);
            console.error("EmployeeController.deleteEmployee():", error);
        }
    };
}
