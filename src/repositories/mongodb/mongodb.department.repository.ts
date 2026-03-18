import { MongoClient, Db, Collection } from 'mongodb'

import { Department } from "../../models/department.js";
import { config } from "./../../configuration/configuration.js";

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
  async createDepartment(department: Department) {
    department.employees = [];
    const client = new MongoClient(config.mongoDbUri);
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      await departmentCollection.insertOne(department);
    } catch (err) {
      console.error("MongoDbDepartmentRepository.createDepartment():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbDepartmentRepository.createDepartment(): department id[%s]", department.id);
  }
  /**
   * Gets the departments.
   * @returns an array of Department objects
   */
  async getDepartments(): Promise<Department[]> {
    const client = new MongoClient(config.mongoDbUri);
    let departments: Department[] = [];
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      departments = await departmentCollection.find({}).sort({ id: 1 }).toArray();
    } catch (err) {
      console.error("MongoDbDepartmentRepository.getDepartments():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbDepartmentRepository.getDepartments() departments number[%s]", departments.length);
    return departments;
  }
  /**
   * Updates an existing department.
   * @param department the department to be updated
   * @returns void
   */
  async updateDepartment(department: Department) {
    department.employees = [];
    const filter = { id: department.id };
    const client = new MongoClient(config.mongoDbUri);
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      await departmentCollection.replaceOne(filter, department);
    } catch (err) {
      console.error("MongoDbDepartmentRepository.updateDepartment():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbDepartmentRepository.updateDepartment() department id[%d]", department.id);
  }
  /**
   * Deletes a department by its id.
   *
   * @param departmentId the id of the department to be deleted
   * @returns void
   */
  async deleteDepartment(departmentId: number) {
    const filter = { id: departmentId };
    const client = new MongoClient(config.mongoDbUri);
    try {
      const database: Db = client.db(config.mongoDbDatabase);
      const departmentCollection: Collection<Department> = database.collection<Department>('departments');
      await departmentCollection.deleteOne(filter);
    } catch (err) {
      console.error("MongoDbDepartmentRepository.deleteDepartment():", err);
      throw err;
    } finally {
      await client.close();
    }
    console.log("MongoDbDepartmentRepository.deleteDepartment(): department id[%d]", departmentId);
  }
}