import { Department } from "../models/department.js";
import { RepositoryType } from "../repositories/repository-type.js";
import { MongoDbInitialization } from "../repositories/mongodb/mongodb.initialization.js";
import { PostgreSQLInitialization } from "../repositories/postgresql/postgresql.initialization.js";
/**
 * This service class provides methods to initialize the database and load initial data.
 */
export class InitializationService {
    mongoDbInitialization: MongoDbInitialization = new MongoDbInitialization();
    postgreSQLInitialization: PostgreSQLInitialization = new PostgreSQLInitialization();
    /**
     * Loads the initial data into the database.
     * @param repositoryType the type of repository to use
     * @param departmentArray the array of departments
     * @returns void
     */
    async loadInitialData(repositoryType: RepositoryType, departmentArray: Department[]) {
        switch (repositoryType) {
            case RepositoryType.MongoDB:
                await this.mongoDbInitialization.loadInitialData(departmentArray);
                break;
            case RepositoryType.PostgreSQL:
            default:
                await this.postgreSQLInitialization.loadInitialData(departmentArray);
                break;
        }
    }
}