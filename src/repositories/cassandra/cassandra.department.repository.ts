import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { clientPromise } from "./cassandra.pool.js";

const CREATE_DEPARTMENT_SQL = `
  INSERT INTO study28.departments (
    id, name, start_date, end_date, notes, keywords, image
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
`;

const SELECT_DEPARTMENTS_SQL = `SELECT * FROM study28.departments`;
const SELECT_EMPLOYEES_SQL = `SELECT * FROM study28.employees`;

/**
 * This service class provides methods to manage departments in Cassandra.
 * It includes CRUD methods to create, read, update, and delete departments.
 */
export class CassandraDepartmentRepository {
    /**
     * Creates a new department.
     * @param dept the department to be created
     * @return void
     */
    async createDepartment(dept: Department): Promise<void> {
        const client = await clientPromise;
        try {
            const startDate = dept.startDate ? new Date(dept.startDate).toISOString().split('T')[0] : null;
            const endDate = dept.endDate ? new Date(dept.endDate).toISOString().split('T')[0] : null;

            const values = [
                dept.id, dept.name, startDate, endDate,
                dept.notes, dept.keywords || null, dept.image
            ];

            await client.execute(CREATE_DEPARTMENT_SQL, values, { prepare: true });
            console.log("CassandraDepartmentRepository.createDepartment(): ID [%d]", dept.id);
        } catch (err) {
            console.error("CassandraDepartmentRepository.createDepartment():", err);
            throw err;
        }
    }

    /**
     * Gets the departments.
     * @returns an array of Department objects
     */
    async getDepartments(): Promise<Department[]> {
        const client = await clientPromise;
        try {
            // 1. Fetch all departments
            const deptResultSet = await client.execute(SELECT_DEPARTMENTS_SQL, [], { prepare: true });
            const departmentMap = new Map<number, Department>();

            for (const row of deptResultSet.rows) {
                const dept: Department = {
                    id: row.id,
                    name: row.name,
                    // Cassandra driver returns dates as standard Date objects or local dates
                    startDate: row.start_date ? new Date(row.start_date) : undefined,
                    endDate: row.end_date ? new Date(row.end_date) : undefined,
                    notes: row.notes,
                    keywords: row.keywords || [],
                    image: row.image,
                    employees: []
                };
                departmentMap.set(row.id, dept);
            }
            // 2. Fetch all employees
            // Note: Full table scans are generally discouraged in Cassandra, but 
            // used here to reconstruct the full document state required by the API.
            const empResultSet = await client.execute(SELECT_EMPLOYEES_SQL, [], { prepare: true });

            for (const row of empResultSet.rows) {
                const dept = departmentMap.get(row.department_id);
                if (dept) {
                    dept.employees.push({
                        id: row.id,
                        departmentId: row.department_id,
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
                    });
                }
            }
            console.log("CassandraDepartmentRepository.getDepartments(): Found [%d] departments", departmentMap.size);
            return Array.from(departmentMap.values());
        } catch (err) {
            console.error("CassandraDepartmentRepository.getDepartments():", err);
            throw err;
        }
    }
}