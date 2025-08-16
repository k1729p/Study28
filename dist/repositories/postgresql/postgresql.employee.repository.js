import { pool } from "./postgresql.pool.js";
const CREATE_EMPLOYEE_SQL = `
    INSERT INTO employees (
		id, department_id, first_name, last_name, title, phone, mail,
		street_name, house_number, postal_code, locality, province, country
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
`;
const SELECT_EMPLOYEES_SQL = `
    SELECT
		id, department_id, first_name, last_name, title, phone, mail,
		street_name, house_number, postal_code, locality, province, country
    FROM employees
`;
const SELECT_EMPLOYEE_SQL = SELECT_EMPLOYEES_SQL + ' WHERE id = $1';
const UPDATE_EMPLOYEE_SQL = `
    UPDATE employees
    SET
		department_id = $1, first_name = $2, last_name = $3, title = $4, phone = $5, mail = $6, street_name = $7,
		house_number = $8, postal_code = $9, locality = $10, province = $11, country = $12
    WHERE id = $13
    RETURNING *
`;
const DELETE_EMPLOYEE_SQL = `
    DELETE FROM employees
    WHERE id = $1
`;
/**
 * This service class provides methods to manage employees.
 * It includes methods to get, set, create, update, and delete employees.
 */
export class PostgreSQLEmployeeRepository {
    /**
     * Creates a new employee.
     * @param employee the employee to be created
     * @return void
     */
    async createEmployee(employee) {
        const client = await pool.connect();
        try {
            const result = await client.query(CREATE_EMPLOYEE_SQL, [
                employee.id,
                employee.departmentId,
                employee.firstName,
                employee.lastName,
                employee.title,
                employee.phone,
                employee.mail,
                employee.streetName,
                employee.houseNumber,
                employee.postalCode,
                employee.locality,
                employee.province,
                employee.country
            ]);
            if (!result.rowCount) {
                console.log("PostgreSQLEmployeeRepository.createEmployee(): no employee created, employee id[%d]", employee.id);
                return;
            }
        }
        catch (err) {
            console.error("PostgreSQLEmployeeRepository.createEmployee():", err);
            throw err;
        }
        finally {
            client.release();
        }
        console.log("PostgreSQLEmployeeRepository.createEmployee(): employee id[%d]", employee.id);
    }
    /**
     * Gets the employees.
     * @returns an array of Employee objects
     */
    async getEmployees() {
        const client = await pool.connect();
        try {
            const result = await client.query(SELECT_EMPLOYEES_SQL);
            console.log("PostgreSQLEmployeeRepository.getEmployees():");
            return result.rows;
        }
        catch (err) {
            console.error("PostgreSQLEmployeeRepository.getEmployees():", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    /**
     * Gets the employee by id.
     * @param id the id of the employee to retrieve
     * @returns the Employee object if found, otherwise undefined
     */
    async getEmployee(id) {
        const client = await pool.connect();
        try {
            const result = await client.query(SELECT_EMPLOYEE_SQL, [id]);
            if (!result.rowCount) {
                console.log("PostgreSQLEmployeeRepository.getEmployee(): no employee found, employee id[%d]", id);
                return undefined;
            }
            console.log("PostgreSQLEmployeeRepository.getEmployee(): employee id[%d]", id);
            return result.rows[0];
        }
        catch (err) {
            console.error("PostgreSQLEmployeeRepository.getEmployee():", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    /**
     * Updates an existing employee.
     * @param employee the employee to be updated
     * @returns void
     */
    async updateEmployee(employee) {
        const client = await pool.connect();
        try {
            const result = await client.query(UPDATE_EMPLOYEE_SQL, [
                employee.departmentId,
                employee.firstName,
                employee.lastName,
                employee.title,
                employee.phone,
                employee.mail,
                employee.streetName,
                employee.houseNumber,
                employee.postalCode,
                employee.locality,
                employee.province,
                employee.country,
                employee.id
            ]);
            if (!result.rowCount) {
                console.log("PostgreSQLEmployeeRepository.updateEmployee(): no employee updated, employee id[%d]", employee.id);
                return;
            }
        }
        catch (err) {
            console.error("PostgreSQLEmployeeRepository.updateEmployee():", err);
            throw err;
        }
        finally {
            client.release();
        }
        console.log("PostgreSQLEmployeeRepository.updateEmployee(): employee id[%d]", employee.id);
    }
    /**
     * Deletes a employee by its id.
     *
     * @param id the id of the employee to be deleted
     * @returns void
     */
    async deleteEmployee(id) {
        const client = await pool.connect();
        try {
            await client.query(DELETE_EMPLOYEE_SQL, [id]);
        }
        catch (err) {
            console.error("PostgreSQLEmployeeRepository.deleteEmployee():", err);
            throw err;
        }
        finally {
            client.release();
        }
        console.log("PostgreSQLEmployeeRepository.deleteEmployee(): employee id[%d]", id);
    }
}
