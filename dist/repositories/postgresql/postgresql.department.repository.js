import { pool } from "./postgresql.pool.js";
const CREATE_DEPARTMENT_SQL = `
    INSERT INTO departments (id, name, start_date, end_date, notes, keywords, image)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
`;
const SELECT_DEPARTMENTS_SQL = `
    SELECT 
        d.id AS department_id, 
        d.name AS department_name, 
        d.start_date, 
        d.end_date, 
        d.notes, 
        d.keywords, 
        d.image,
        e.id AS employee_id,
        e.department_id AS employee_department_id,
        e.first_name,
        e.last_name,
        e.title,
        e.phone,
        e.mail,
        e.street_name,
        e.house_number,
        e.postal_code,
        e.locality,
        e.province,
        e.country
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id
`;
const SELECT_DEPARTMENT_SQL = SELECT_DEPARTMENTS_SQL + 'WHERE d.id = $1';
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
    async createDepartment(department) {
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
                console.log("PostgreSQLDepartmentRepository.createDepartment(): no department created with id[%d]", department.id);
                return;
            }
        }
        catch (err) {
            console.error("PostgreSQLDepartmentRepository.createDepartment():", err);
            throw err;
        }
        finally {
            client.release();
        }
        console.log("PostgreSQLDepartmentRepository.createDepartment(): department id[%s]", department.id);
    }
    /**
     * Gets the departments.
     * @returns an array of Department objects
     */
    async getDepartments() {
        const client = await pool.connect();
        try {
            const result = await client.query(SELECT_DEPARTMENTS_SQL);
            console.log("PostgreSQLDepartmentRepository.getDepartments():");
            const departmentMap = new Map();
            for (const row of result.rows) {
                const departmentId = row.department_id;
                let department = departmentMap.get(departmentId);
                if (!department) {
                    department = {
                        id: row.department_id,
                        name: row.department_name,
                        startDate: row.start_date,
                        endDate: row.end_date,
                        notes: row.notes,
                        keywords: row.keywords,
                        image: row.image,
                        employees: []
                    };
                    departmentMap.set(departmentId, department);
                }
                if (row.employee_id) {
                    const employee = {
                        id: row.employee_id,
                        departmentId: row.employee_department_id,
                        firstName: row.first_name,
                        lastName: row.last_name,
                        title: row.title,
                        phone: row.phone,
                        mail: row.mail,
                        streetName: row.street_name,
                        houseNumber: row.house_number,
                        postalCode: row.postal_code,
                        locality: row.locality,
                        province: row.province,
                        country: row.country
                    };
                    department.employees.push(employee);
                }
            }
            return Array.from(departmentMap.values());
        }
        catch (err) {
            console.error("PostgreSQLDepartmentRepository.getDepartments():", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    /**
     * Gets the department by id.
     * @param id the id of the department to retrieve
     * @returns the Department object if found, otherwise undefined
     */
    async getDepartment(id) {
        const client = await pool.connect();
        try {
            const result = await client.query(SELECT_DEPARTMENT_SQL, [id]);
            if (!result.rowCount) {
                console.log("PostgreSQLDepartmentRepository.getDepartment(): no department found with id[%d]", id);
                return undefined;
            }
            const rows = result.rows;
            const row = rows[0];
            const department = {
                id: row.department_id,
                name: row.department_name,
                startDate: row.start_date,
                endDate: row.end_date,
                notes: row.notes,
                keywords: row.keywords,
                image: row.image,
                employees: []
            };
            for (const row of rows) {
                if (row.employee_id) {
                    const employee = {
                        id: row.employee_id,
                        departmentId: row.employee_department_id,
                        firstName: row.first_name,
                        lastName: row.last_name,
                        title: row.title,
                        phone: row.phone,
                        mail: row.mail,
                        streetName: row.street_name,
                        houseNumber: row.house_number,
                        postalCode: row.postal_code,
                        locality: row.locality,
                        province: row.province,
                        country: row.country
                    };
                    department.employees.push(employee);
                }
            }
            console.log("PostgreSQLDepartmentRepository.getDepartment(): id[%d]", id);
            return department;
        }
        catch (err) {
            console.error("PostgreSQLDepartmentRepository.getDepartment():", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    /**
     * Updates an existing department.
     * @param department the department to be updated
     * @returns void
     */
    async updateDepartment(department) {
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
                console.log("PostgreSQLDepartmentRepository.updateDepartment(): no department updated with id[%d]", department.id);
                return;
            }
        }
        catch (err) {
            console.error("PostgreSQLDepartmentRepository.updateDepartment():", err);
            throw err;
        }
        finally {
            client.release();
        }
        console.log("PostgreSQLDepartmentRepository.updateDepartment(): department id[%s]", department.id);
    }
    /**
     * Deletes a department by its id.
     *
     * @param id the id of the department to be deleted
     * @returns void
     */
    async deleteDepartment(id) {
        const client = await pool.connect();
        try {
            await client.query(DELETE_DEPARTMENT_SQL, [id]);
        }
        catch (err) {
            console.error("PostgreSQLDepartmentRepository.deleteDepartment():", err);
            throw err;
        }
        finally {
            client.release();
        }
        console.log("PostgreSQLDepartmentRepository.deleteDepartment(): department id[%d]", id);
    }
}
