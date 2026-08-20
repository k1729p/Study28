import { Db, Collection } from 'mongodb'

import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { config } from "./../../configuration/configuration.js";
import { poolPromise } from "./mongodb.pool.js";
import { DepartmentRepository } from "../department.repository.js";
/**
 * Repository class providing methods to manage departments.
 * Includes CRUD operations to create, read, update, and delete departments.
 */
export class MongoDbDepartmentRepository implements DepartmentRepository {
  /**
   * Creates a new department.
   * 
   * @param department - The department to be created.
   * @returns A promise that resolves when the department is created.
   */
  async createDepartment(department: Department): Promise<void> {
    const client = await poolPromise;
    try {
      const database = client.db(config.mongoDbDatabase);
      const departmentCollection = database.collection<Department>('departments');
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
   * Retrieves all departments.
   * 
   * @returns A promise that resolves to an array of Department objects.
   */
  async getDepartments(): Promise<Department[]> {
    const client = await poolPromise;
    try {
      const database = client.db(config.mongoDbDatabase);
      const departmentCollection = database.collection<Department>('departments');
      const departments = await departmentCollection.aggregate<Department>([
        {
          $sort: {
            id: 1
          }
        },
        {
          $lookup: {
            from: 'employees',
            localField: 'id',
            foreignField: 'departmentId',
            as: 'employees'
          }
        },
        {
          $addFields: {
            employees: {
              $sortArray: {
                input: "$employees",
                sortBy: {
                  id: 1
                }
              }
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
   * Retrieves a department by its ID.
   * 
   * @param id - The ID of the department to retrieve.
   * @returns A promise that resolves to the Department object if found, otherwise undefined.
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const client = await poolPromise;
    try {
      const database = client.db(config.mongoDbDatabase);
      const departmentCollection = database.collection<Department>('departments');
      const departments = await departmentCollection.aggregate<Department>([
        {
          $match: {
            id: id
          }
        },
        {
          $lookup: {
            from: 'employees',
            localField: 'id',
            foreignField: 'departmentId',
            as: 'employees'
          }
        },
        {
          $addFields: {
            employees: {
              $sortArray: {
                input: "$employees",
                sortBy: {
                  id: 1
                }
              }
            }
          }
        }
      ]).toArray();
      const department = departments[0];
      if (!department) {
        console.log("MongoDbDepartmentRepository.getDepartment(): department not found, department id[%d]", id);
        return undefined;
      }
      console.log("MongoDbDepartmentRepository.getDepartment(): department id[%d]", id);
      return department;
    } catch (err) {
      console.error("MongoDbDepartmentRepository.getDepartment():", err);
      throw err;
    }
  }
  /**
   * Updates an existing department.
   * 
   * @param department - The department object containing updated values.
   * @returns A promise that resolves when the update is complete.
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
   * Deletes a department by its ID.
   * 
   * @param id - The ID of the department to be deleted.
   * @returns A promise that resolves when the department is deleted.
   */
  async deleteDepartment(id: number): Promise<void> {
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.deleteMany({ departmentId: id });
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      await departmentCollection.deleteOne({ id: id });
    } catch (err) {
      console.error("MongoDbDepartmentRepository.deleteDepartment():", err);
      throw err;
    }
    console.log("MongoDbDepartmentRepository.deleteDepartment(): department id[%d]", id);
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
      console.warn("MongoDbEmployeeRepository.transferEmployees(): no employee ids provided, nothing to transfer");
      return;
    }
    const filter = { departmentId: sourceDepartmentId };
    const update = { $set: { departmentId: targetDepartmentId } };
    const client = await poolPromise;
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const employeeCollection: Collection<Employee> = database.collection<Employee>('employees');
      await employeeCollection.updateMany(filter, update);
    } catch (err) {
      console.error("MongoDbEmployeeRepository.transferEmployees():", err);
      throw err;
    }
    console.log("MongoDbEmployeeRepository.transferEmployees(): " +
      "source department id[%d], target department id[%d], transferred employees count[%d]",
      sourceDepartmentId, targetDepartmentId, employeeIds.length);
  }
}
