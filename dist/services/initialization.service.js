import { PostgreSQLInitialization } from "../repositories/postgresql.initialization.js";
/**
 * This service class provides methods to initialize the database and load initial data.
 */
export class InitializationService {
    postgreSQLInitialization = new PostgreSQLInitialization();
    /**
     * Loads the initial data into the database.
     * @param departmentArray the array of departments
     * @param employeeArray the array of employees
     * @returns void
     */
    async loadInitialData(departmentArray, employeeArray) {
        await this.postgreSQLInitialization.loadInitialData(departmentArray, employeeArray);
    }
}
