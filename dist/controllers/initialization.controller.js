import { InitializationService } from "../services/initialization.service.js";
/**
 * This service class provides methods to initialize database and load data.
 */
export class InitializationController {
    initializationService = new InitializationService();
    /**
     * Set all departments.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    loadInitialData = async (req, res, next) => {
        try {
            const { departments, employees } = req.body;
            const departmentArray = departments;
            const employeeArray = employees;
            await this.initializationService.loadInitialData(departmentArray, employeeArray);
            res.status(204).json();
            console.log("InitializationController.loadInitialData():");
        }
        catch (error) {
            next(error);
            console.error("InitializationController.loadInitialData(): error[%s]", error);
        }
    };
}
