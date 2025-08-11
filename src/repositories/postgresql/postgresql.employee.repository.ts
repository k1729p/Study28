import { Employee } from "../../models/employee.js";
import { pool } from "./postgresql.pool.js";

const CREATE_EMPLOYEE_SQL = `
    INSERT INTO employees (
		id, first_name, last_name, title, phone, mail,
		street_name, house_number, postal_code, locality, province, country
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
`;
const SELECT_EMPLOYEES_SQL = `
    SELECT
		id, first_name, last_name, title, phone, mail,
		street_name, house_number, postal_code, locality, province, country
    FROM employees
`;
const SELECT_EMPLOYEE_SQL = SELECT_EMPLOYEES_SQL + 'WHERE id = $1';
const UPDATE_EMPLOYEE_SQL = `
    UPDATE employees
    SET
		first_name = $1, last_name = $2, title = $3, phone = $4, mail = $5, street_name = $6,
		house_number = $7, postal_code = $8, locality = $9, province = $10, country = $11
    WHERE id = $12
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
     * @param departmentId the department ID to which the employee belongs
     * @param employee the employee to be created
     * @return void
     */
    async createEmployee(departmentId: number, employee: Employee) {
        const client = await pool.connect();
        try {
            const result = await client.query(CREATE_EMPLOYEE_SQL, [
                employee.id,
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
                console.log("PostgreSQLEmployeeRepository.createEmployee(): no employee created, department id[%d]",
                    departmentId);

                return;
            }
        } catch (err) {
            console.error("PostgreSQLEmployeeRepository.createEmployee():", err);
            throw err;
        } finally {
            client.release();
        }
        console.log("PostgreSQLEmployeeRepository.createEmployee(): department id[%d], employee id[%d]",
            departmentId, employee.id);
    }
    /**
     * Gets the employees.
     * @returns an array of Employee objects
     */
    async getEmployees(): Promise<Employee[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(SELECT_EMPLOYEES_SQL);
            console.log("PostgreSQLEmployeeRepository.getEmployees():");
            return result.rows as Employee[];
        } catch (err) {
            console.error("PostgreSQLEmployeeRepository.getEmployees():", err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Gets the employees.
     * @param departmentId the department ID to which the employees belongs
     * @returns an array of Employee objects
     */
    async getEmployeesByDepartmentId(departmentId: number): Promise<Employee[]> {
        const client = await pool.connect();
        try {
            // TODO const result = await client.query(SELECT_EMPLOYEES_SQL + ' WHERE department_id = $1', [departmentId]);
            const result = await client.query(SELECT_EMPLOYEES_SQL);
            console.log("PostgreSQLEmployeeRepository.getEmployeesByDepartmentId():");
            return result.rows as Employee[];
        } catch (err) {
            console.error("PostgreSQLEmployeeRepository.getEmployeesByDepartmentId():", err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Gets the employee by id.
     * @param departmentId the department ID to which the employee belongs
     * @param id the id of the employee to retrieve
     * @returns the Employee object if found, otherwise undefined
     */
    async getEmployee(departmentId: number, id: number): Promise<Employee | undefined> {
        const client = await pool.connect();
        try {
            const result = await client.query(SELECT_EMPLOYEE_SQL, [id]);
            if (!result.rowCount) {
                console.log("PostgreSQLEmployeeRepository.getEmployee(): no employee found, department id[%d], employee id[%d]",
                    departmentId, id);
                return undefined;
            }
            console.log("PostgreSQLEmployeeRepository.getEmployee(): department id[%d], employee id[%d]", departmentId, id);
            return result.rows[0] as Employee;
        } catch (err) {
            console.error("PostgreSQLEmployeeRepository.getEmployee():", err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Updates an existing employee.
     * @param departmentId the department ID to which the employee belongs
     * @param employee the employee to be updated
     * @returns void
     */
    async updateEmployee(departmentId: number, employee: Employee) {
        const client = await pool.connect();
        try {
            const result = await client.query(UPDATE_EMPLOYEE_SQL, [
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
                console.log("PostgreSQLEmployeeRepository.updateEmployee(): no employee updated, department id[%d], employee id[%d]",
                    departmentId, employee.id);
                return;
            }
        } catch (err) {
            console.error("PostgreSQLEmployeeRepository.updateEmployee():", err);
            throw err;
        } finally {
            client.release();
        }
        console.log("PostgreSQLEmployeeRepository.updateEmployee(): department id[%d], employee id[%d]",
            departmentId, employee.id);
    }

    /**
     * Deletes a employee by its id.
     *
     * @param departmentId the department ID to which the employee belongs
     * @param id the id of the employee to be deleted
     * @returns void
     */
    async deleteEmployee(departmentId: number, id: number) {
        const client = await pool.connect();
        try {
            await client.query(DELETE_EMPLOYEE_SQL, [id]);
        } catch (err) {
            console.error("PostgreSQLEmployeeRepository.deleteEmployee():", err);
            throw err;
        } finally {
            client.release();
        }
        console.log("PostgreSQLEmployeeRepository.deleteEmployee(): department id[%d], employee id[%d]",
            departmentId, id);
    }

}