import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class ElasticsearchDepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(department: Department): Promise<void> {
    console.log("ElasticsearchDepartmentRepository.createDepartment(): id[%d]", department.id);
  }

  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
      //console.log("ElasticsearchDepartmentRepository.getDepartments(): departments count[%d]", departmentMap.size);
      return [];
  }
}