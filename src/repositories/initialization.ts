import { Department } from "../models/department.js";
/**
 * This repository interface provides methods to initialize database and load data.
 */
export interface Initialization {
  /**
   * Loads the initial data into the database.
   * @param departments the array of departments
   */
  loadInitialData(departmentArray: Department[]): Promise<void>;
}
