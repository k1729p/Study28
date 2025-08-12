import { StatusCodes } from 'http-status-codes';
import { DepartmentService } from "../services/department.service.js";
/**
 * This service class provides methods to manage departments.
 */
export class DepartmentController {
    departmentService = new DepartmentService();
    /**
     * Create a new department.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    createDepartment = async (req, res, next) => {
        const department = req.body;
        if (!department || !department.id) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
            console.error("DepartmentController.createDepartment(): invalid department id");
            return;
        }
        try {
            await this.departmentService.createDepartment(department);
        }
        catch (error) {
            next(error);
            console.error("DepartmentController.createDepartment():", error);
            return;
        }
        res.status(StatusCodes.CREATED).json();
        console.log("DepartmentController.createDepartment(): id[%s]", department.id);
    };
    /**
     * Get all departments.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    getDepartments = async (req, res, next) => {
        try {
            const departmentArray = await this.departmentService.getDepartments();
            res.status(StatusCodes.OK).json(departmentArray);
        }
        catch (error) {
            next(error);
            console.error("DepartmentController.getDepartments():", error);
            return;
        }
        console.log("DepartmentController.getDepartments():");
    };
    /**
     * Get a department by ID.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    getDepartmentById = async (req, res, next) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
            console.error("DepartmentController.getDepartmentById(): invalid department id");
            return;
        }
        try {
            const department = await this.departmentService.getDepartment(id);
            if (!department) {
                res.status(StatusCodes.NOT_FOUND).json({ message: 'Department not found' });
                console.log("DepartmentController.getDepartmentById(): department not found, id[%s]", id);
                return;
            }
            res.status(StatusCodes.OK).json(department);
        }
        catch (error) {
            next(error);
            console.error("DepartmentController.getDepartmentById():", error);
            return;
        }
        console.log("DepartmentController.getDepartmentById(): id[%s]", id);
    };
    /**
     * Update a department.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    updateDepartment = async (req, res, next) => {
        const department = req.body;
        if (!department || !department.id) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
            console.error("DepartmentController.updateDepartment(): invalid department id");
            return;
        }
        try {
            await this.departmentService.updateDepartment(department);
        }
        catch (error) {
            next(error);
            console.error("DepartmentController.updateDepartment():", error);
            return;
        }
        res.status(StatusCodes.NO_CONTENT).json();
        console.log("DepartmentController.updateDepartment(): id[%s]", department.id);
    };
    /**
     * Delete a department.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns void
     */
    deleteDepartment = async (req, res, next) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
            console.error("DepartmentController.deleteDepartment(): invalid department id");
            return;
        }
        try {
            await this.departmentService.deleteDepartment(id);
        }
        catch (error) {
            next(error);
            console.error("DepartmentController.deleteDepartment():", error);
        }
        res.status(StatusCodes.NO_CONTENT).json();
        console.log("DepartmentController.deleteDepartment(): id[%s]", id);
    };
}
