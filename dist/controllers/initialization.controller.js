import { StatusCodes } from 'http-status-codes';
import { InitializationService } from "../services/initialization.service.js";
import { RepositoryType } from '../repositories/repository-type.js';
import { RED_BRIGHT, RESET } from "../colors.js";
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
        const repositoryType = req.query.repositoryType || RepositoryType.PostgreSQL;
        const departmentArray = req.body.departments || [];
        try {
            await this.initializationService.loadInitialData(repositoryType, departmentArray);
        }
        catch (error) {
            next(error);
            console.error("InitializationController.loadInitialData(): error[%s]", error);
            return;
        }
        res.status(StatusCodes.NO_CONTENT).json();
        console.log("%sInitializationController.loadInitialData():%s repositoryType[%s]", RED_BRIGHT, RESET, repositoryType);
    };
}
