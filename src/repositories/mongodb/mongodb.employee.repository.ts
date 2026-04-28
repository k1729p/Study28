import { Db, Collection } from 'mongodb'

import { Employee } from "../../models/employee.js";
import { config } from "./../../configuration/configuration.js";
import { poolPromise } from "./mongodb.pool.js";
import { EmployeeRepository } from "../employee.repository.js";

/**
 * This service class provides methods to manage employees.
 * It includes CRUD methods to create, read, update, and delete employees.
 */
export class MongoDbEmployeeRepository implements EmployeeRepository {
  /**
   * Creates a new employee.
   * @param employee the employee to be created
   * @return void
   */
  async createEmployee(employee: Employee): Promise<void> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.insertOne(employee);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.createEmployee():", err);
      throw err;
    }
    console.log("MongoDbEmployeeRepository.createEmployee() employee id[%s]", employee.id);
  }
  /**
   * Gets the employees.
   * @returns an array of Employee objects
   */
  async getEmployees(): Promise<Employee[]> {
    const client = await poolPromise;
    let employees: Employee[] = [];
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      employees = await employeeCollection.find().sort({ id: 1 }).toArray();
    } catch (err) {
      console.error("MongoDbEmployeeRepository.getEmployees():", err);
      throw err;
    }
    console.log("MongoDbEmployeeRepository.getEmployees(): employees count[%s]", employees.length);
    return employees;
  }
  /**
   * Gets the employee by id.
   * @param id the id of the employee to retrieve
   * @returns the Employee object if found, otherwise undefined
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      const employee = await employeeCollection.findOne({ id: id });
      console.log("MongoDbEmployeeRepository.getEmployee():%s id[%d]", id, employee ? "" : " employee not found,");
      return employee ?? undefined;
    } catch (err) {
      console.error("MongoDbEmployeeRepository.getEmployee():", err);
      throw err;
    }
  }
  /**
   * Updates an existing employee.
   * @param employee the employee to be updated
   * @returns void
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
      throw err;
    }
    console.log("MongoDbEmployeeRepository.updateEmployee() employee id[%d]", employee.id);
  }
  /**
   * Deletes a employee by its id.
   *
   * @param employeeId the id of the employee to be deleted
   * @returns void
   */
  async deleteEmployee(employeeId: number): Promise<void> {
    const filter = { id: employeeId };
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.deleteOne(filter);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.deleteEmployee():", err);
      throw err;
    }
    console.log("MongoDbEmployeeRepository.deleteEmployee(): employee id[%d]", employeeId);
  }
}