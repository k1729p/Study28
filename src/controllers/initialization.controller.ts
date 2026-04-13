import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Department } from "../models/department.js";
import { InitializationService } from "../services/initialization.service.js";
import { RepositoryType } from '../repositories/repository-type.js';
import * as colors from "./../utils/colors.js";
/**
 * This controller class provides methods to initialize database and load data.
 */
export class InitializationController {
  initializationService = new InitializationService();
  /**
   * Set all departments.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  loadInitialData = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = req.query.repositoryType as RepositoryType || RepositoryType.PostgreSQL;
    const departments: Department[] = req.body.departments || [];
    console.count(repositoryType);
    try {
      await this.initializationService.loadInitialData(repositoryType, departments);
    } catch (error) {
      next(error);
      console.error("InitializationController.loadInitialData(): error[%s]", error);
      return;
    }
    res.status(StatusCodes.NO_CONTENT).json();
    console.log("%sInitializationController.loadInitialData():%s repositoryType[%s]",
      colors.RED_BRIGHT, colors.RESET, repositoryType);
  };
}
