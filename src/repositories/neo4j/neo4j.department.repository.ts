import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { driverPromise } from "./neo4j.pool.js";
import { CREATE_DEPARTMENT_QUERY, READ_DEPARTMENTS_QUERY } from "./neo4j.constants.js";
/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class Neo4jDepartmentRepository {
  /**
   * Creates a new department.
   * @param department the department to be created
   * @return void
   */
  async createDepartment(department: Department): Promise<void> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const startDate = department.startDate ? new Date(department.startDate).toISOString().split('T')[0] : null;
      const endDate = department.endDate ? new Date(department.endDate).toISOString().split('T')[0] : null;
      const parameters = {
        id: department.id,
        name: department.name,
        startDate: startDate,
        endDate: endDate,
        notes: department.notes || null,
        keywords: department.keywords ? department.keywords.join(',') : null,
        image: department.image || null
      };
      await session.executeWrite(transaction => transaction.run(CREATE_DEPARTMENT_QUERY, parameters));
      console.log("Neo4jDepartmentRepository.createDepartment(): id[%d]", department.id);
    } catch (err) {
      console.error("Neo4jDepartmentRepository.createDepartment():", err);
      throw err;
    } finally {
      await session.close();
    }
  }
  /**
   * Gets the departments along with their associated employees.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const driver = await driverPromise;
    const session = driver.session();
    try {
      const result = await session.executeRead(transaction => transaction.run(READ_DEPARTMENTS_QUERY));
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
      console.log("Neo4jDepartmentRepository.getDepartments():");
      return departments;
    } catch (err) {
      console.error("Neo4jDepartmentRepository.getDepartments():", err);
      throw err;
    } finally {
      await session.close();
    }
  }
  async getDepartment(id: number): Promise<Department | undefined> {
    return undefined;
  }
  async updateDepartment(department: Department): Promise<void> {
  }
  async deleteDepartment(departmentId: number): Promise<void> {
  }
}