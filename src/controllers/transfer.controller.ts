import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { TransferService } from "../services/transfer.service.js";
import { RepositoryType } from '../repositories/repository-type.js';
import { BLUE_BRIGHT, RESET } from "../colors.js";
/**
 * This controller class provides methods to manage transfers.
 */
export class TransferController {
  transferService = new TransferService();
  /**
   * Transfers the employees from the source department to the target department.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns void
   */
  transferEmployees = async (req: Request, res: Response, next: NextFunction) => {
    const repositoryType = req.query.repositoryType as RepositoryType || RepositoryType.PostgreSQL;
    const { sourceDepartmentId, targetDepartmentId, employeeIds } = req.body;
    if (!sourceDepartmentId || !targetDepartmentId ||
      !Array.isArray(employeeIds) || employeeIds.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid transfer data' });
      console.error("TransferController.transferEmployees(): invalid transfer data");
      return;
    }
    try {
      await this.transferService.transferEmployees(
        repositoryType, sourceDepartmentId, targetDepartmentId, employeeIds);
    } catch (error) {
      next(error);
      console.error("TransferController.transferEmployees():", error);
      return;
    }
    res.status(StatusCodes.NO_CONTENT).json();
    console.log(
      "%sTransferController.transferEmployees():%s repositoryType[%s], source id[%s], target id[%s], employees %j",
      BLUE_BRIGHT, RESET, repositoryType, sourceDepartmentId, targetDepartmentId, employeeIds);
  };
}
