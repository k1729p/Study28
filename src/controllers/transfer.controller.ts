import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { TransferService } from "../services/transfer.service.js";
import { RepositoryType } from '../repositories/repository-type.js';
import * as colors from "../utils/colors.js";
/**
 * This controller class provides methods to manage transfers.
 */
export class TransferController {
  /**
   * Constructor.
   * @param transferService the transfer service
   */
  constructor(private transferService: TransferService) { }
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
    if (!sourceDepartmentId) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid source department id' });
      console.error("TransferController.transferEmployees(): " +
        "bad request, client error, invalid source department id");
      return;
    }
    if (!targetDepartmentId) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid target department id' });
      console.error("TransferController.transferEmployees(): " +
        "bad request, client error, invalid target department id");
      return;
    }
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid or empty employee ids array' });
      console.error("TransferController.transferEmployees(): " +
        "bad request, client error, invalid or empty employee ids array");
      return;
    }
    try {
      await this.transferService.transferEmployees(
        repositoryType, sourceDepartmentId, targetDepartmentId, employeeIds);
    } catch (error) {
      next(error);
      console.error("TransferController.transferEmployees(): error[%s]", (error as Error).message);
      return;
    }
    res.status(StatusCodes.NO_CONTENT).json();
    console.log(
      "%sTransferController.transferEmployees():%s repositoryType[%s], source id[%s], target id[%s], employees %j",
      colors.BLUE_BRIGHT, colors.RESET, repositoryType, sourceDepartmentId, targetDepartmentId, employeeIds);
  };
}
