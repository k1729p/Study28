import { PoolClient } from "pg";
import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { pool } from "./postgresql.pool.js";

const DROP_TABLE_EMPLOYEES_SQL = 'DROP TABLE IF EXISTS employees;';
const DROP_TABLE_DEPARTMENTS_SQL = 'DROP TABLE IF EXISTS departments;';

const CREATE_TABLE_DEPARTMENTS_SQL = `
    CREATE TABLE departments (
        id integer PRIMARY KEY,
        name varchar(40) NOT NULL CHECK (name <> ''),
        start_date date,
        end_date date,
        notes text,
        keywords text[],
        image varchar(255)
    )
`;

const CREATE_TABLE_EMPLOYEES_SQL = `
    CREATE TABLE employees (
        id integer PRIMARY KEY,
        department_id integer REFERENCES departments(id),
        first_name varchar(40) NOT NULL,
        last_name varchar(40) NOT NULL,
        title varchar(40) NOT NULL,
        phone varchar(30) NOT NULL,
        mail varchar(80) NOT NULL,
        street_name varchar(80),
        house_number varchar(20),
        postal_code varchar(20),
        locality varchar(40),
        province varchar(40),
        country varchar(40)
    )
`;

const BULK_INSERT_DEPARTMENTS_SQL_PREFIX = `
    INSERT INTO departments
        (id, name, start_date, end_date, notes, keywords, image)
    VALUES
`;

const BULK_INSERT_EMPLOYEES_SQL_PREFIX = `
    INSERT INTO employees
        (id, department_id, first_name, last_name, title, phone, mail,
        street_name, house_number, postal_code, locality, province, country)
    VALUES
`;

/**
 * This service class provides methods to initialize database and load data.
 */
export class PostgreSQLInitialization {
    /**
     * Loads the initial data into the database.
     * @param departmentArray the array of departments
     */
    async loadInitialData(departmentArray: Department[]) {
        const client = await pool.connect();
        try {
            await this.dropTables(client);
            await this.createTables(client);
            await this.insertDepartments(client, departmentArray);
            const allEmployees = departmentArray.flatMap(dep =>
                dep.employees.map(emp => ({ ...emp, departmentId: dep.id }))
            );
            await this.insertEmployees(client, allEmployees);
            console.log(`PostgreSQLInitialization.loadInitialData(): Successfully loaded ${departmentArray.length} departments and ${allEmployees.length} employees.`);
        } catch (err) {
            console.error("PostgreSQLInitialization.loadInitialData():", err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Drops the database tables in correct order.
     */
    private async dropTables(client: PoolClient) {
        try {
            await client.query(DROP_TABLE_EMPLOYEES_SQL);
            await client.query(DROP_TABLE_DEPARTMENTS_SQL);
        } catch (err) {
            console.error("PostgreSQLInitialization.dropTables():", err);
            throw err;
        }
    }

    /**
     * Creates the database tables.
     */
    private async createTables(client: PoolClient) {
        try {
            await client.query(CREATE_TABLE_DEPARTMENTS_SQL);
            await client.query(CREATE_TABLE_EMPLOYEES_SQL);
        } catch (err) {
            console.error("PostgreSQLInitialization.createTables():", err);
            throw err;
        }
    }

    /**
     * Inserts the department data into the database.
     * @param departmentArray the array of departments
     */
    private async insertDepartments(client: PoolClient, departmentArray: Department[]) {
        if (departmentArray.length === 0) {
            console.warn("PostgreSQLInitialization.insertDepartments(): no departments to insert");
            return;
        }
        const values: any[] = [];
        const valuePlaceholders: string[] = [];
        departmentArray.forEach((dep, i) => {
            const startDate = dep.startDate ? new Date(dep.startDate) : null;
            const endDate = dep.endDate ? new Date(dep.endDate) : null;
            const idx = i * 7;
            valuePlaceholders.push(
                `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7})`
            );
            values.push(
                dep.id,
                dep.name,
                startDate ? startDate.toISOString().split('T')[0] : null,
                endDate ? endDate.toISOString().split('T')[0] : null,
                dep.notes ?? null,
                dep.keywords ?? null,
                dep.image ?? null
            );
        });
        const sql = BULK_INSERT_DEPARTMENTS_SQL_PREFIX + valuePlaceholders.join(", ");
        try {
            const res = await client.query(sql, values);
            console.debug(`Inserted ${res.rowCount ?? departmentArray.length} departments.`);
        } catch (err) {
            console.error("PostgreSQLInitialization.insertDepartments():", err);
            throw err;
        }
    }

    /**
     * Inserts the employee data into the database.
     * @param employeeArray the array of employees
     */
    private async insertEmployees(client: PoolClient, employeeArray: Employee[]) {
        if (employeeArray.length === 0) {
            console.warn("PostgreSQLInitialization.insertEmployees(): no employees to insert");
            return;
        }
        const values: any[] = [];
        const valuePlaceholders: string[] = [];
        employeeArray.forEach((emp, i) => {
            const idx = i * 13;
            valuePlaceholders.push(
                `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6},
                 $${idx + 7}, $${idx + 8}, $${idx + 9}, $${idx + 10}, $${idx + 11}, $${idx + 12},
                 $${idx + 13})`
            );
            values.push(
                emp.id,
                emp.departmentId,
                emp.firstName,
                emp.lastName,
                emp.title,
                emp.phone,
                emp.mail,
                emp.streetName ?? null,
                emp.houseNumber ?? null,
                emp.postalCode ?? null,
                emp.locality ?? null,
                emp.province ?? null,
                emp.country ?? null
            );
        });
        const sql = BULK_INSERT_EMPLOYEES_SQL_PREFIX + valuePlaceholders.join(", ");
        try {
            const res = await client.query(sql, values);
            console.debug(`Inserted ${res.rowCount ?? employeeArray.length} employees.`);
        } catch (err) {
            console.error("PostgreSQLInitialization.insertEmployees():", err);
            throw err;
        }
    }
}