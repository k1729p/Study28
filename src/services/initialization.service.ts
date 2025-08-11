import { Department } from "../models/department.js";
import { PostgreSQLInitialization } from "../repositories/postgresql/postgresql.initialization.js";
/**
 * This service class provides methods to initialize the database and load initial data.
 */
export class InitializationService {
    postgreSQLInitialization: PostgreSQLInitialization = new PostgreSQLInitialization();
    /**
     * Loads the initial data into the database.
     * @param departmentArray the array of departments
     * @returns void
     */
    async loadInitialData(departmentArray: Department[]) {
        await this.postgreSQLInitialization.loadInitialData(departmentArray);
    }
}