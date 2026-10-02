import { Db, Collection } from 'mongodb'

import { Employee } from "../../models/employee.js";
import { config } from "./../../configuration/configuration.js";
import { poolPromise } from "./mongodb.pool.js";
import { EmployeeRepository } from "../employee.repository.js";
import { RepositoryException } from "../repository-exception.js";
/**
 * Repository interface providing methods to manage employees.
 * Includes CRUD operations to create, read, update, and delete employees.
 */
export class MongoDbEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * 
   * @param employee - The employee to be created.
   * @returns A promise that resolves when the employee is created.
   */
  async createEmployee(employee: Employee): Promise<void> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.insertOne(employee);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.createEmployee():", err);
      throw new RepositoryException(
        `Failed to create employee, employee id[${employee.id}]`,
        { cause: err, operation: 'createEmployee' }
      );
    }
    console.log("MongoDbEmployeeRepository.createEmployee() employee id[%s]", employee.id);
  }
  /**
   * Retrieves all employees.
   * 
   * @returns A promise that resolves to an array of Employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      const employees = await employeeCollection.find().sort({ id: 1 }).toArray();
      console.log("MongoDbEmployeeRepository.getEmployees(): employees count[%s]", employees.length);
      return employees;
    } catch (err) {
      console.error("MongoDbEmployeeRepository.getEmployees():", err);
      throw new RepositoryException(
        `Failed to get employees`,
        { cause: err, operation: 'getEmployees' }
      );
    }
  }
  /**
   * Retrieves an employee by their ID.
   * 
   * @param id - The ID of the employee to retrieve.
   * @returns A promise that resolves to the Employee object if found, otherwise undefined.
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      const employee = await employeeCollection.findOne({ id: id });
      if (!employee) {
        console.log("MongoDbDepartmentRepository.getEmployee(): employee not found, employee id[%d]", id);
        return undefined;
      }
      console.log("MongoDbDepartmentRepository.getEmployee(): employee id[%d]", id);
      return employee;
    } catch (err) {
      console.error("MongoDbEmployeeRepository.getEmployee():", err);
      throw new RepositoryException(
        `Failed to get employee, employee id[${id}]`,
        { cause: err, operation: 'getEmployee' }
      );
    }
  }
  /**
   * Updates an existing employee.
   * 
   * @param employee - The employee object containing updated values.
   * @returns A promise that resolves when the update is complete.
   */
  async updateEmployee(employee: Employee): Promise<void> {
    const filter = { id: employee.id };
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.replaceOne(filter, employee);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.updateEmployee():", err);
      throw new RepositoryException(
        `Failed to update employee, employee id[${employee.id}]`,
        { cause: err, operation: 'updateEmployee' }
      );
    }
    console.log("MongoDbEmployeeRepository.updateEmployee() employee id[%d]", employee.id);
  }
  /**
   * Deletes an employee by their ID.
   * 
   * @param id - The ID of the employee to be deleted.
   * @returns A promise that resolves when the employee is deleted.
   */
  async deleteEmployee(id: number): Promise<void> {
    const filter = { id: id };
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.deleteOne(filter);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.deleteEmployee():", err);
      throw new RepositoryException(
        `Failed to delete employee, employee id[${id}]`,
        { cause: err, operation: 'deleteEmployee' }
      );
    }
    console.log("MongoDbEmployeeRepository.deleteEmployee(): employee id[%d]", id);
  }
}