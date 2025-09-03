import { MongoClient, Db, Collection } from 'mongodb'

import { Employee } from "../../models/employee.js";
import { config } from "./../../configuration/configuration.js";

/**
 * This service class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 */
export class MongoDbEmployeeRepository {
  /**
   * Creates a new employee.
   * @param employee the employee to be created
   * @return void
   */
  async createEmployee(employee: Employee) {
    const client = new MongoClient(config.mongoDbUri);
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.insertOne(employee);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.createEmployee():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbEmployeeRepository.createEmployee() employee id[%s]", employee.id);
  }
  /**
   * Gets the employees by the department id.
   * @param departmentId the department id of the employees to retrieve
   * @returns an array of Employee objects
   */
  async getEmployees(departmentId: number): Promise<Employee[]> {
    const filter = { departmentId: departmentId };
    const client = new MongoClient(config.mongoDbUri);
    let employees: Employee[] = [];
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      employees = await employeeCollection.find(filter).sort({ id: 1 }).toArray();
    } catch (err) {
      console.error("MongoDbEmployeeRepository.getEmployees():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbEmployeeRepository.getEmployees(): departmentId[%d], employees number[%s]",
      departmentId, employees.length);
    return employees;
  }
  /**
   * Updates an existing employee.
   * @param employee the employee to be updated
   * @returns void
   */
  async updateEmployee(employee: Employee) {
    const filter = { id: employee.id };
    const client = new MongoClient(config.mongoDbUri);
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.replaceOne(filter, employee);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.updateEmployee():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbEmployeeRepository.updateEmployee() employee id[%d]", employee.id);
  }
  /**
   * Deletes a employee by its id.
   *
   * @param employeeId the id of the employee to be deleted
   * @returns void
   */
  async deleteEmployee(employeeId: number) {
    const filter = { id: employeeId };
    const client = new MongoClient(config.mongoDbUri);
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.deleteOne(filter);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.deleteEmployee():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbEmployeeRepository.deleteEmployee(): employee id[%d]", employeeId);
  }

  /**
   * Transfers the employees from source department to target department.
   * 
   * @param sourceDepartmentId the id of the source department
   * @param targetDepartmentId the id of the target department
   * @param employeeIds the transferred employees array
   * @returns void
   */
  async transferEmployees(sourceDepartmentId: number, targetDepartmentId: number, employeeIds: number[]) {
    const filter = { departmentId: sourceDepartmentId };
    const update = { $set: { departmentId: targetDepartmentId } };
    const client = new MongoClient(config.mongoDbUri);
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.updateMany(filter, update);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.transferEmployees():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbEmployeeRepository.transferEmployees(): " +
      "source department id[%d], target department id[%d], transferred employees number[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}