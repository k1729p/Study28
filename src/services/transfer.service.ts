import { RepositoryType } from "../repositories/repository-type.js";
import { MongoDbEmployeeRepository } from "../repositories/mongodb/mongodb.employee.repository.js";
import { PostgreSQLDepartmentRepository } from "../repositories/postgresql/postgresql.department.repository.js";
/**
 * This service class provides methods to transfer employees.
 */
export class TransferService {
  mongoDbEmployeeRepository: MongoDbEmployeeRepository = new MongoDbEmployeeRepository();
  postgreSQLDepartmentRepository: PostgreSQLDepartmentRepository = new PostgreSQLDepartmentRepository();
  /**
   * Transfers the employees from the source department to the target department.
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the transferred employees array
   * @returns void
   */
  async transferEmployees(repositoryType: RepositoryType,
    sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]) {
    switch (repositoryType) {
      case RepositoryType.MongoDB:
        this.mongoDbEmployeeRepository.transferEmployees(
          sourceDepartmentId, targetDepartmentId, employeeIds);
        break;
      case RepositoryType.PostgreSQL:
      default:
        await this.postgreSQLDepartmentRepository.transferEmployees(
          sourceDepartmentId, targetDepartmentId, employeeIds);
        break;
    }
  }
}