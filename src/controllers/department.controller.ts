import { Request, Response, NextFunction } from 'express';
import { Department } from "../models/department.js";
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
  createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    const department: Department = req.body;
    try {
      await this.departmentService.createDepartment(department);
    } catch (error) {
      next(error);
      console.error("DepartmentController.createDepartment():", error);
      return;
    }
    res.status(201).json();
    console.log("DepartmentController.createDepartment(): id[%s]", department.id);
  };
  /**
   * Get all departments.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const departmentArray = await this.departmentService.getDepartments();
      res.status(200).json(departmentArray);
    } catch (error) {
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
  getDepartmentById = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    try {
      const department = await this.departmentService.getDepartment(id);
      if (!department) {
        res.status(404).json({ message: 'Department not found' });
        console.log("DepartmentController.getDepartmentById(): department not found, id[%s]", id);
        return;
      }
      res.status(200).json(department);
    } catch (error) {
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
  updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
    const department: Department = req.body;
    try {
      await this.departmentService.updateDepartment(department);
    } catch (error) {
      next(error);
      console.error("DepartmentController.updateDepartment():", error);
      return;
    }
    res.status(204).json();
    console.log("DepartmentController.updateDepartment(): id[%s]", department.id);
  };

  /**
   * Delete a department.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns void
   */
  deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.departmentService.deleteDepartment(id);
      res.status(204).json();
      console.log("DepartmentController.deleteDepartment(): id[%s]", id);
    } catch (error) {
      next(error);
      console.error("DepartmentController.deleteDepartment():", error);
    }
  };
}
