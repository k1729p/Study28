import { Db, Collection } from 'mongodb'

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { config } from "./../../configuration/configuration.js";
import { poolPromise } from "./mongodb.pool.js";

/**
 * This service class provides methods to manage departments.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class MongoDbDepartmentRepository {
  /**
 * Creates a new department.
 * @param department the department to be created
 * @return void
 */
  async createDepartment(department: Department): Promise<void> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      const localDepartment = structuredClone(department);
      localDepartment.employees = [];
      await departmentCollection.insertOne(localDepartment);
    } catch (err) {
      console.error("MongoDbDepartmentRepository.createDepartment():", err);
      throw err;
    }
    console.log("MongoDbDepartmentRepository.createDepartment(): department id[%s]", department.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      const departments = await departmentCollection.aggregate<Department>([
        {// Sort departments by id
          $sort: { id: 1 }
        },
        {// Join collection 'employees'
          $lookup: {
            from: 'employees',
            localField: 'id',
            foreignField: 'departmentId',
            as: 'employees'
          }
        },
        {// Sort employees within each department
          $addFields: {
            employees: {
              $sortArray: { input: "$employees", sortBy: { id: 1 } }
            }
          }
        }
      ]).toArray();
      console.log("MongoDbDepartmentRepository.getDepartments() departments count[%s]", departments.length);
      return departments;
    } catch (err) {
      console.error("MongoDbDepartmentRepository.getDepartments():", err);
      throw err;
    }
  }
  /**
   * Gets the department by id.
   * @param id the id of the department to retrieve
   * @returns the Department object if found, otherwise undefined
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      const departments = await departmentCollection.aggregate<Department>([
        {// Find the department
          $match: {
             id: id
             }
        }, 
        {// Join with employees collection
          $lookup: {
            from: 'employees',          
            localField: 'id',
            foreignField: 'departmentId',
            as: 'employees'
          }
        },
        {// Sort the employees by id
          $addFields: {
            employees: {
              $sortArray: { input: "$employees", sortBy: { id: 1 } }
            }
          }
        }
      ]).toArray();
      // Since 'id' is unique, we just take the first result
      const department = departments[0];
      console.log("MongoDbDepartmentRepository.getDepartment():%s id[%d]", id, department ? "" : " department not found,");
      return department ?? undefined;
    } catch (err) {
      console.error("MongoDbDepartmentRepository.getDepartment():", err);
      throw err;
    }
  }  
  /**
   * Updates an existing department.
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(department: Department): Promise<void> {
    const filter = { id: department.id };
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      const localDepartment = structuredClone(department);
      localDepartment.employees = [];
      await departmentCollection.replaceOne(filter, localDepartment);
    } catch (err) {
      console.error("MongoDbDepartmentRepository.updateDepartment():", err);
      throw err;
    }
    console.log("MongoDbDepartmentRepository.updateDepartment() department id[%d]", department.id);
  }
  /**
   * Deletes a department by its id.
   *
   * @param departmentId the id of the department to be deleted
   * @returns void
   */
  async deleteDepartment(departmentId: number): Promise<void> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.deleteMany({ departmentId: departmentId });
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      await departmentCollection.deleteOne({ id: departmentId });
    } catch (err) {
      console.error("MongoDbDepartmentRepository.deleteDepartment():", err);
      throw err;
    }
    console.log("MongoDbDepartmentRepository.deleteDepartment(): department id[%d]", departmentId);
  }
}
