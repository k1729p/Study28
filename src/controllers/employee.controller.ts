import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { EmployeeService } from "../services/employee.service.js";
import { toRepositoryType, bodyToEmployee } from "./controller-mappers.js";
import * as colors from "./../utils/colors.js";
/**
 * This controller class provides methods to manage employees.
 */
export class EmployeeController {
  /**
   * Constructor.
   * @param employeeService the employee service
   */
  constructor(private employeeService: EmployeeService) { }
  /**
   * Create a new employee.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    const employee = bodyToEmployee(req.body);
    if (!employee || !employee.id) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
      console.error("EmployeeController.createEmployee(): " +
        "bad request, client error, invalid employee id");
      return;
    }
    try {
      await this.employeeService.createEmployee(repositoryType, employee);
      res.status(StatusCodes.CREATED).json();
    } catch (error) {
      next(error);
      console.error("EmployeeController.createEmployee(): error[%s]", (error as Error).message);
      return;
    }
    console.log("%sEmployeeController.createEmployee():%s repositoryType[%s], id[%s]",
      colors.RED_BRIGHT, colors.RESET, repositoryType, employee.id);
  };
  /**
   * Get all employees.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  getEmployees = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    try {
      const employees = await this.employeeService.getEmployees(repositoryType);
      res.status(StatusCodes.OK).json(employees);
    } catch (error) {
      next(error);
      console.error("EmployeeController.getEmployees(): error[%s]", (error as Error).message);
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
  getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
      console.error("EmployeeController.getEmployeeById(): " +
        "bad request, client error, invalid employee id");
      return;
    }
    try {
      const employee = await this.employeeService.getEmployee(repositoryType, id);
      if (!employee) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Employee not found' });
        console.warn("EmployeeController.getEmployeeById(): warning, employee not found, id[%s]", id);
        return;
      }
      res.status(StatusCodes.OK).json(employee);
    } catch (error) {
      next(error);
      console.error("EmployeeController.getEmployeeById(): error[%s]", (error as Error).message);
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
  updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    const employee = bodyToEmployee(req.body);
    if (!employee || !employee.id) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
      console.error("EmployeeController.updateEmployee(): " +
        "bad request, client error, invalid employee id");
      return;
    }
    try {
      await this.employeeService.updateEmployee(repositoryType, employee);
      res.status(StatusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
      console.error("EmployeeController.updateEmployee(): error[%s]", (error as Error).message);
      return;
    }
    console.log("%sEmployeeController.updateEmployee():%s repositoryType[%s], id[%s]",
      colors.MAGENTA_BRIGHT, colors.RESET, repositoryType, employee.id);
  };
  /**
   * Delete a employee.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns void
   */
  deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid employee id' });
      console.error("EmployeeController.deleteEmployee(): " +
        "bad request, client error, invalid employee id");
      return;
    }
    try {
      await this.employeeService.deleteEmployee(repositoryType, id);
      res.status(StatusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
      console.error("EmployeeController.deleteEmployee(): error[%s]", (error as Error).message);
    }
    console.log("%sEmployeeController.deleteEmployee():%s repositoryType[%s], id[%s]",
      colors.CYAN_BRIGHT, colors.RESET, repositoryType, id);
  };
}
