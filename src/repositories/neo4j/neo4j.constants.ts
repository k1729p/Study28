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
 * Cypher query to fetch Departments and collect their associated Employees via the WORKS_IN relationship.
 */
export const READ_DEPARTMENTS_QUERY = `
  MATCH (department:Department)
  OPTIONAL MATCH (employee:Employee)-[:WORKS_IN]->(department)
  RETURN department, collect(employee) AS employees
`;
