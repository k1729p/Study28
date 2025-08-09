import { Department } from "../models/department.js";
import { Employee } from "../models/employee.js";
import { PostgreSQLInitialization } from "../repositories/postgresql/postgresql.initialization.js";
/**
 * This service class provides methods to initialize the database and load initial data.
 */
export class InitializationService {
    postgreSQLInitialization: PostgreSQLInitialization = new PostgreSQLInitialization();
    /**
     * Loads the initial data into the database.
     * @param departmentArray the array of departments
     * @param employeeArray the array of employees
     * @returns void
     */
    async loadInitialData(departmentArray: Department[], employeeArray: Employee[][]) {
        await this.postgreSQLInitialization.loadInitialData(departmentArray, employeeArray);
    }
}