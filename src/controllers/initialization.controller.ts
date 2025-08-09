import { Request, Response, NextFunction } from 'express';

import { Department } from "../models/department.js";
import { Employee } from "../models/employee.js";
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
  loadInitialData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { departments, employees } = req.body;
      const departmentArray: Department[] = departments;
      const employeeArray: Employee[][] = employees;
      await this.initializationService.loadInitialData(departmentArray, employeeArray);
      res.status(204).json();
      console.log("InitializationController.loadInitialData():");
    } catch (error) {
      next(error);
      console.error("InitializationController.loadInitialData(): error[%s]", error);
    }
  };
}
