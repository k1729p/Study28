import { Department } from "../../models/department.js";
import { pool } from "./postgresql.pool.js";

const CREATE_DEPARTMENT_SQL = `
    INSERT INTO departments (id, name, start_date, end_date, notes, keywords, image)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
`;
const SELECT_DEPARTMENTS_SQL = `
    SELECT id, name, start_date, end_date, notes, keywords, image
    FROM departments
`;
const SELECT_DEPARTMENT_SQL = SELECT_DEPARTMENTS_SQL + 'WHERE id = $1';
const UPDATE_DEPARTMENT_SQL = `
    UPDATE departments
    SET name = $1, start_date = $2, end_date = $3, notes = $4, keywords = $5, image = $6
    WHERE id = $7
    RETURNING *
`;
const DELETE_DEPARTMENT_SQL = `
    DELETE FROM departments
    WHERE id = $1
`;
/**
 * This service class provides methods to manage departments.
 * It includes methods to get, set, create, update, and delete departments.
 */
export class PostgreSQLDepartmentRepository {
    /**
     * Creates a new department.
     * @param department the department to be created
     * @return void
     */
    async createDepartment(department: Department) {
        const client = await pool.connect();
        try {
            const result = await client.query(CREATE_DEPARTMENT_SQL, [
                department.id,
                department.name,
                department.startDate,
                department.endDate,
                department.notes,
                department.keywords,
                department.image
            ]);
            if (!result.rowCount) {
                console.log("PostgreSQLDepartmentRepository.createDepartment(): no department created with id[%d]",
                    department.id);
                return;
            }
        } catch (err) {
            console.error("PostgreSQLDepartmentRepository.createDepartment():", err);
            throw err;
        } finally {
            client.release();
        }
        console.log("PostgreSQLDepartmentRepository.createDepartment(): department id[%s]",
            department.id);
    }
    /**
     * Gets the departments.
     * @returns an array of Department objects
     */
    async getDepartments(): Promise<Department[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(SELECT_DEPARTMENTS_SQL);
            console.log("PostgreSQLDepartmentRepository.getDepartments():");
            return result.rows as Department[];
        } catch (err) {
            console.error("PostgreSQLDepartmentRepository.getDepartments():", err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Gets the department by id.
     * @param id the id of the department to retrieve
     * @returns the Department object if found, otherwise undefined
     */
    async getDepartment(id: number): Promise<Department | undefined> {
        const client = await pool.connect();
        try {
            const result = await client.query(SELECT_DEPARTMENT_SQL, [id]);
            if (!result.rowCount) {
                console.log("PostgreSQLDepartmentRepository.getDepartment(): no department found with id[%d]", id);
                return undefined;
            }
            console.log("PostgreSQLDepartmentRepository.getDepartment(): id[%d]", id);
            return result.rows[0] as Department;
        } catch (err) {
            console.error("PostgreSQLDepartmentRepository.getDepartment():", err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Updates an existing department.
     * @param department the department to be updated
     * @returns void
     */
    async updateDepartment(department: Department) {
        const client = await pool.connect();
        try {
            const result = await client.query(UPDATE_DEPARTMENT_SQL, [
                department.name,
                department.startDate,
                department.endDate,
                department.notes,
                department.keywords,
                department.image,
                department.id
            ]);
            if (!result.rowCount) {
                console.log("PostgreSQLDepartmentRepository.updateDepartment(): no department updated with id[%d]",
                    department.id);
                return;
            }
        } catch (err) {
            console.error("PostgreSQLDepartmentRepository.updateDepartment():", err);
            throw err;
        } finally {
            client.release();
        }
        console.log("PostgreSQLDepartmentRepository.updateDepartment(): department id[%s]",
            department.id);
    }

    /**
     * Deletes a department by its id.
     *
     * @param id the id of the department to be deleted
     * @returns void
     */
    async deleteDepartment(id: number) {
        const client = await pool.connect();
        try {
            await client.query(DELETE_DEPARTMENT_SQL, [id]);
        } catch (err) {
            console.error("PostgreSQLDepartmentRepository.deleteDepartment():", err);
            throw err;
        } finally {
            client.release();
        }
        console.log("PostgreSQLDepartmentRepository.deleteDepartment(): department id[%d]", id);
    }

}