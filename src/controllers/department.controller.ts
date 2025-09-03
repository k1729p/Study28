import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Department } from "../models/department.js";
import { DepartmentService } from "../services/department.service.js";
import { RepositoryType } from '../repositories/repository-type.js';
import { RED_BRIGHT, GREEN_BRIGHT, CYAN_BRIGHT, MAGENTA_BRIGHT, RESET } from "../colors.js";
/**
 * This controller class provides methods to manage departments.
 */
export class DepartmentController {
  departmentService = new DepartmentService();
  /**
   * Create a new department.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = req.query.repositoryType as RepositoryType || RepositoryType.PostgreSQL;
    const department: Department = req.body;
    if (!department || !department.id) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
      console.error("DepartmentController.createDepartment(): invalid department id");
      return;
    }
    try {
      await this.departmentService.createDepartment(repositoryType, department);
    } catch (error) {
      next(error);
      console.error("DepartmentController.createDepartment():", error);
      return;
    }
    res.status(StatusCodes.CREATED).json();
    console.log("%sDepartmentController.createDepartment():%s repositoryType[%s], id[%s]",
      RED_BRIGHT, RESET, repositoryType, department.id);
  };
  /**
   * Get all departments.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = req.query.repositoryType as RepositoryType || RepositoryType.PostgreSQL;
    try {
      const departments = await this.departmentService.getDepartments(repositoryType);
      res.status(StatusCodes.OK).json(departments);
    } catch (error) {
      next(error);
      console.error("DepartmentController.getDepartments():", error);
      return;
    }
    console.log("%sDepartmentController.getDepartments():%s repositoryType[%s]",
      GREEN_BRIGHT, RESET, repositoryType);
  };
  /**
   * Get a department by ID.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns void
   */
  getDepartmentById = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = req.query.repositoryType as RepositoryType || RepositoryType.PostgreSQL;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
      console.error("DepartmentController.getDepartmentById(): invalid department id");
      return;
    }
    try {
      const department = await this.departmentService.getDepartment(repositoryType, id);
      if (!department) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Department not found' });
        console.log("DepartmentController.getDepartmentById(): department not found, id[%s]", id);
        return;
      }
      res.status(StatusCodes.OK).json(department);
    } catch (error) {
      next(error);
      console.error("DepartmentController.getDepartmentById():", error);
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
    const repositoryType = req.query.repositoryType as RepositoryType || RepositoryType.PostgreSQL;
    const department: Department = req.body;
    if (!department || !department.id) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
      console.error("DepartmentController.updateDepartment(): invalid department id");
      return;
    }
    try {
      await this.departmentService.updateDepartment(repositoryType, department);
    } catch (error) {
      next(error);
      console.error("DepartmentController.updateDepartment():", error);
      return;
    }
    res.status(StatusCodes.NO_CONTENT).json();
    console.log("%sDepartmentController.updateDepartment():%s repositoryType[%s], id[%s]",
      MAGENTA_BRIGHT, RESET, repositoryType, department.id);
  };
  /**
   * Delete a department.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns void
   */
  deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = req.query.repositoryType as RepositoryType || RepositoryType.PostgreSQL;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid department id' });
      console.error("DepartmentController.deleteDepartment(): invalid department id");
      return;
    }
    try {
      await this.departmentService.deleteDepartment(repositoryType, id);
    } catch (error) {
      next(error);
      console.error("DepartmentController.deleteDepartment():", error);
    }
    res.status(StatusCodes.NO_CONTENT).json();
    console.log("%sDepartmentController.deleteDepartment():%s repositoryType[%s], id[%s]",
      CYAN_BRIGHT, RESET, repositoryType, id);
  };
}
