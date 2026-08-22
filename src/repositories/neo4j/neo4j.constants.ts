import neo4j, { AuthToken, Config } from 'neo4j-driver';

import { config } from "./../../configuration/configuration.js";
/**
 * The database connection URI.
 * <SCHEME>://<HOST>:<PORT>
 */
export const CONNECTION_URI = `bolt://${config.neo4jHost}:${config.neo4jPort}`;
/**
 * The authorization token using basic authentication scheme.
 */
export const AUTH_TOKEN: AuthToken = neo4j.auth.basic(config.neo4jUser, config.neo4jPassword);
/**
 * Configuration for the driver.
 */
export const DRIVER_CONFIG: Config = {
  encrypted: 'ENCRYPTION_OFF',
  trust: 'TRUST_ALL_CERTIFICATES'
};
export const DELETE_QUERY = 'MATCH (n) DETACH DELETE n';
// --- department queries ---------------------------------------------------------------------------
/**
 * Cypher query to create departments.
 */
export const CREATE_DEPARTMENTS_QUERY = `
  UNWIND $departments AS dep
  CREATE (department:Department {
    id: dep.id, 
    name: dep.name, 
    startDate: dep.startDate, 
    endDate: dep.endDate, 
    notes: dep.notes, 
    keywords: dep.keywords, 
    image: dep.image
  })
`;
/**
 * Cypher query to create department.
 */
export const CREATE_DEPARTMENT_QUERY = `
  CREATE (department:Department {
    id: $id,
    name: $name,
    startDate: $startDate,
    endDate: $endDate,
    notes: $notes,
    keywords: $keywords,
    image: $image
  })
`;
/**
 * Cypher query to fetch departments and
 * collect their associated dmployees via the WORKS_IN relationship.
 */
export const READ_DEPARTMENTS_QUERY = `
  MATCH (department:Department)
  OPTIONAL MATCH (employee:Employee)-[:WORKS_IN]->(department)
  RETURN department, collect(employee) AS employees
`;
/**
 * Cypher query to fetch a single department by id and
 * collect its associated employees via the WORKS_IN relationship.
 */
export const READ_DEPARTMENT_QUERY = `
  MATCH (department:Department {id: $id})
  OPTIONAL MATCH (employee:Employee)-[:WORKS_IN]->(department)
  RETURN department, collect(employee) AS employees
`;
/**
 * Cypher query to update the properties of an existing Department node.
 * Employee associations are managed independently via the WORKS_IN relationship.
 */
export const UPDATE_DEPARTMENT_QUERY = `
  MATCH (department:Department {id: $id})
  SET
    department.name = $name,
    department.startDate = $startDate,
    department.endDate = $endDate,
    department.notes = $notes,
    department.keywords = $keywords,
    department.image = $image
  RETURN department
`;
/**
 * Cypher query to delete a Department node together with every Employee node
 * connected to it via the WORKS_IN relationship (cascading delete).
 * The employees are collected and deleted through a FOREACH clause rather than a plain
 * 'DETACH DELETE department, employee', because the OPTIONAL MATCH may yield no employee
 * at all, and FOREACH safely tolerates an empty collection.
 */
export const DELETE_DEPARTMENT_QUERY = `
  MATCH (department:Department {id: $id})
  OPTIONAL MATCH (department)<-[:WORKS_IN]-(employee:Employee)
  WITH department, collect(employee) AS employees
  FOREACH (emp IN employees | DETACH DELETE emp)
  DETACH DELETE department
`;
/**
 * Cypher query that transfers a set of employees from a source Department to a target Department.
 * 
 * The target Department is resolved once up front; if it does not exist the UNWIND
 * produces no rows and nothing is changed. For each requested employee id, the query
 * only acts if that Employee currently WORKS_IN the source Department.
 * The old WORKS_IN relationship is replaced with a new one to the target Department,
 * and the denormalized 'departmentId' property kept on the Employee node is updated to match.
 *
 * Parameterized Cypher statement is executed inside a managed write transaction via 'session.executeWrite'.
 * A managed transaction function commits only if the whole statement succeeds and
 * automatically rolls back and retries on transient errors, which gives the same all-or-nothing guarantee
 * a relational stored procedure call wrapped in a transaction would provide.
 */
export const TRANSFER_EMPLOYEES_QUERY = `
  MATCH (targetDepartment:Department {id: $targetDepartmentId})
  UNWIND $employeeIds AS employeeId
  MATCH (employee:Employee {id: employeeId})-[relationship:WORKS_IN]->(:Department {id: $sourceDepartmentId})
  DELETE relationship
  CREATE (employee)-[:WORKS_IN]->(targetDepartment)
  SET employee.departmentId = $targetDepartmentId
  RETURN employee.id AS employeeId
`;
// --- employee queries -----------------------------------------------------------------------------
/**
 * Cypher query to create employees.
 */
export const CREATE_EMPLOYEES_QUERY = `
  UNWIND $employees AS emp
  MATCH (department:Department {id: emp.departmentId})
  CREATE (employee:Employee {
    id: emp.id,
    departmentId: emp.departmentId,
    firstName: emp.firstName, 
    lastName: emp.lastName, 
    title: emp.title, 
    phone: emp.phone, 
    mail: emp.mail, 
    streetName: emp.streetName, 
    houseNumber: emp.houseNumber, 
    postalCode: emp.postalCode, 
    locality: emp.locality, 
    province: emp.province, 
    country: emp.country
  })-[:WORKS_IN]->(department)
`;
/**
 * Cypher query to create a single Employee node and connect it to its Department via
 * the WORKS_IN relationship. The Department is matched explicitly first, which is the
 * graph-database equivalent of a relational foreign-key constraint: if the Department
 * does not exist, no Employee node is created.
 */
export const CREATE_EMPLOYEE_QUERY = `
  MATCH (department:Department {id: $departmentId})
  CREATE (employee:Employee {
    id: $id,
    departmentId: $departmentId,
    firstName: $firstName,
    lastName: $lastName,
    title: $title,
    phone: $phone,
    mail: $mail,
    streetName: $streetName,
    houseNumber: $houseNumber,
    postalCode: $postalCode,
    locality: $locality,
    province: $province,
    country: $country
  })-[:WORKS_IN]->(department)
  RETURN employee
`;
/**
 * Cypher query to fetch all Employee nodes, ordered by id.
 */
export const READ_EMPLOYEES_QUERY = `
  MATCH (employee:Employee)
  RETURN employee
  ORDER BY employee.id
`;
/**
 * Cypher query to fetch a single Employee node by id.
 */
export const READ_EMPLOYEE_QUERY = `
  MATCH (employee:Employee {id: $id})
  RETURN employee
`;
/**
 * Cypher query to update the properties of an existing Employee node and, if needed,
 * move it to a different Department. The Employee and the target Department are both
 * matched up front so that, if either one is missing, the query yields no rows and no
 * write is performed. The existing WORKS_IN relationship (if any) is collected via
 * OPTIONAL MATCH and removed through a FOREACH clause -- rather than a plain
 * 'DELETE relationship' -- because FOREACH safely tolerates the empty collection produced
 * when the employee did not yet have a WORKS_IN relationship. A fresh relationship to the
 * target Department is then created, keeping the graph and the denormalized 'departmentId'
 * property in sync even when the department has not actually changed.
 */
export const UPDATE_EMPLOYEE_QUERY = `
  MATCH (employee:Employee {id: $id})
  MATCH (department:Department {id: $departmentId})
  OPTIONAL MATCH (employee)-[relationship:WORKS_IN]->(:Department)
  WITH employee, department, collect(relationship) AS relationships
  FOREACH (rel IN relationships | DELETE rel)
  SET
    employee.departmentId = $departmentId,
    employee.firstName = $firstName,
    employee.lastName = $lastName,
    employee.title = $title,
    employee.phone = $phone,
    employee.mail = $mail,
    employee.streetName = $streetName,
    employee.houseNumber = $houseNumber,
    employee.postalCode = $postalCode,
    employee.locality = $locality,
    employee.province = $province,
    employee.country = $country
  CREATE (employee)-[:WORKS_IN]->(department)
  RETURN employee
`;
/**
 * Cypher query to delete a single Employee node together with its WORKS_IN relationship.
 */
export const DELETE_EMPLOYEE_QUERY = `
  MATCH (employee:Employee {id: $id})
  DETACH DELETE employee
`;
