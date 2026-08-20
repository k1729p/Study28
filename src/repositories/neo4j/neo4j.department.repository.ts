import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { driverPromise } from "./neo4j.pool.js";
import { DepartmentRepository } from "../department.repository.js";
import * as constants from "./neo4j.constants.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export class Neo4jDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  async createDepartment(department: Department): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      await session.executeWrite(transaction => transaction.run(constants.CREATE_DEPARTMENT_QUERY,
        constants.PARAMETERS_FOR_DEPARTMENT(department)));
    } catch (err) {
      console.error("Neo4jDepartmentRepository.createDepartment():", err);
      throw err;
    } finally {
      await session.close();
    }
    console.log("Neo4jDepartmentRepository.createDepartment(): department id[%d]", department.id);
  }
  /**
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeRead(transaction => transaction.run(constants.READ_DEPARTMENTS_QUERY));
      const departments: Department[] = result.records.map(record => {
        const departmentNode = record.get('department').properties;
        const department: Department = {
          id: departmentNode.id.toNumber ? departmentNode.id.toNumber() : Number(departmentNode.id),
          name: departmentNode.name,
          startDate: departmentNode.startDate ? new Date(departmentNode.startDate) : undefined,
          endDate: departmentNode.endDate ? new Date(departmentNode.endDate) : undefined,
          notes: departmentNode.notes,
          keywords: departmentNode.keywords ? departmentNode.keywords.split(',') : [],
          image: departmentNode.image,
          employees: []
        };
        const employeesNodes = record.get('employees');
        if (employeesNodes && employeesNodes.length > 0) {
          department.employees = employeesNodes
            .filter((node: any) => node !== null) // Filter out nulls from empty OPTIONAL MATCH collections
            .map((node: any) => {
              const employeeProperties = node.properties;
              return {
                id: employeeProperties.id.toNumber ? employeeProperties.id.toNumber() : Number(employeeProperties.id),
                departmentId: department.id,
                firstName: employeeProperties.firstName,
                lastName: employeeProperties.lastName,
                title: employeeProperties.title,
                phone: employeeProperties.phone,
                mail: employeeProperties.mail,
                streetName: employeeProperties.streetName,
                houseNumber: employeeProperties.houseNumber,
                postalCode: employeeProperties.postalCode,
                locality: employeeProperties.locality,
                province: employeeProperties.province,
                country: employeeProperties.country
              } as Employee;
            });
        }
        return department;
      });
      console.log("Neo4jDepartmentRepository.getDepartments(): departments count[%d]", departments.length);
      return departments;
    } catch (err) {
      console.error("Neo4jDepartmentRepository.getDepartments():", err);
      throw err;
    } finally {
      await session.close();
    }
  }
  /**
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    console.log("Neo4jDepartmentRepository.getDepartment(): department id[%d]", id);
    return undefined;
  }
  /**
   * Updates an existing department.
   * 
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateDepartment(department: Department): Promise<void> {
    console.log("Neo4jDepartmentRepository.updateDepartment() department id[%d]", department.id);
  }
  /**
   * Deletes a department by its ID.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    console.log("Neo4jDepartmentRepository.deleteDepartment(): department id[%d]", id);
  }
  /**
   * Transfers employees from a source department to a target department.
   * 
   * @param sourceDepartmentId - The ID of the source department.
   * @param targetDepartmentId - The ID of the target department.
   * @param employeeIds - An array of IDs representing the employees to be transferred.
   * @returns A promise that resolves when the transfer is complete.
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]): Promise<void> {
    if (employeeIds.length === 0) {
      console.warn("Neo4jDepartmentRepository.transferEmployees(): no employee ids provided, nothing to transfer");
      return;
    }
    // to implement
    console.log("Neo4jDepartmentRepository.transferEmployees(): " +
      "source department id[%d], target department id[%d], transferred employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}