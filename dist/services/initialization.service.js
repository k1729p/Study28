import { RepositoryType } from "../repositories/repository-type.js";
import { PostgreSQLInitialization } from "../repositories/postgresql/postgresql.initialization.js";
/**
 * This service class provides methods to initialize the database and load initial data.
 */
export class InitializationService {
    postgreSQLInitialization = new PostgreSQLInitialization();
    /**
     * Loads the initial data into the database.
     * @param repositoryType the type of repository to use
     * @param departmentArray the array of departments
     * @returns void
     */
    async loadInitialData(repositoryType, departmentArray) {
        switch (repositoryType) {
            case RepositoryType.MongoDB:
                break;
            case RepositoryType.PostgreSQL:
            default:
                await this.postgreSQLInitialization.loadInitialData(departmentArray);
                break;
        }
    }
}
