import { Department } from "../models/department.js";

/**
 * Interface providing methods to initialize the database and load seed data.
 */
export interface Initialization {
  /**
   * Loads initial department data into the database.
   * 
   * @param departments - An array of Department objects to populate.
   * @returns A promise that resolves when data loading is complete.
   */
  loadInitialData(departments: Department[]): Promise<void>;
}