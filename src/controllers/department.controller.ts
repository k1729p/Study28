import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { DepartmentService } from "../services/department.service.js";
import { toRepositoryType, bodyToDepartment } from "./mappers.js";
import * as colors from "./../utils/colors.js";
/**
 * This controller class provides methods to manage departments.
 */
export class DepartmentController {
  /**
   * Constructor.
   * @param departmentService the department service
   */
  constructor(private departmentService: DepartmentService) { }
  /**
   * Create a new department.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    const department = bodyToDepartment(req.body);
    if (!department || !department.id) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
      console.error("DepartmentController.createDepartment(): " +
        "bad request, client error, invalid department id");
      return;
    }
    try {
      await this.departmentService.createDepartment(repositoryType, department);
      res.status(StatusCodes.CREATED).json();
    } catch (error) {
      next(error);
      console.error("DepartmentController.createDepartment(): error[%s]", (error as Error).message);
      return;
    }
    console.log("%sDepartmentController.createDepartment():%s repositoryType[%s], id[%s]",
      colors.RED_BRIGHT, colors.RESET, repositoryType, department.id);
  };

  /**
   * Get all departments.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    try {
      const departments = await this.departmentService.getDepartments(repositoryType);
      res.status(StatusCodes.OK).json(departments);
    } catch (error) {
      next(error);
      console.error("DepartmentController.getDepartments(): error[%s]", (error as Error).message);
      return;
    }
    console.log("%sDepartmentController.getDepartments():%s repositoryType[%s]",
      colors.GREEN_BRIGHT, colors.RESET, repositoryType);
  };
  /**
   * Get a department by ID.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns void
   */
  getDepartmentById = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
      console.error("DepartmentController.getDepartmentById(): " +
        "bad request, client error, invalid department id");
      return;
    }
    try {
      const department = await this.departmentService.getDepartment(repositoryType, id);
      if (!department) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Department not found' });
        console.warn("DepartmentController.getDepartmentById(): warning, department not found, id[%s]", id);
        return;
      }
      res.status(StatusCodes.OK).json(department);
    } catch (error) {
      next(error);
      console.error("DepartmentController.getDepartmentById(): error[%s]", (error as Error).message);
      return;
    }
    console.log("DepartmentController.getDepartmentById(): repositoryType[%s], id[%s]", repositoryType, id);
  };
  /**
   * Update a department.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns void
   */
  updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    const department = bodyToDepartment(req.body);
    if (!department || !department.id) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
      console.error("DepartmentController.updateDepartment(): " +
        "bad request, client error, invalid department id");
      return;
    }
    try {
      await this.departmentService.updateDepartment(repositoryType, department);
      res.status(StatusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
      console.error("DepartmentController.updateDepartment(): error[%s]", (error as Error).message);
      return;
    }
    console.log("%sDepartmentController.updateDepartment():%s repositoryType[%s], id[%s]",
      colors.MAGENTA_BRIGHT, colors.RESET, repositoryType, department.id);
  };
  /**
   * Delete a department.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns void
   */
  deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = toRepositoryType(req.query.repositoryType);
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
      console.error("DepartmentController.deleteDepartment(): " +
        "bad request, client error, invalid department id");
      return;
    }
    try {
      await this.departmentService.deleteDepartment(repositoryType, id);
      res.status(StatusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
      console.error("DepartmentController.deleteDepartment(): error[%s]", (error as Error).message);
    }
    console.log("%sDepartmentController.deleteDepartment():%s repositoryType[%s], id[%s]",
      colors.CYAN_BRIGHT, colors.RESET, repositoryType, id);
  };
}
