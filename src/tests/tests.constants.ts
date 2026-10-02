import { Department } from '../models/department.js';
import { Employee } from "../models/employee.js";
import { Title } from '../models/title.js';
import { RepositoryType } from '../repositories/repository-type.js';
import { INITIAL_DATA, MAX_INT_32, MAX_BATCH_EMPLOYEE_IDS } from '../services/services.constants.js';

export const LOAD_URI = '/load/';
export const DEPARTMENTS_URI = '/departments/';
export const DEPARTMENT_BY_ID_URI = '/departments/:id';
export const EMPLOYEES_URI = '/employees/';
export const EMPLOYEE_BY_ID_URI = '/employees/:id';
export const TRANSFERS_URI = '/transfers/';

export const TEST_DEPARTMENTS = INITIAL_DATA;
export const TEST_MINIMAL_DATA: Department[] = [{
  id: 12345,
  name: 'D',
  employees: [{
    id: 67890,
    departmentId: 12345,
    firstName: 'FN',
    lastName: 'LN',
    title: Title.Analyst,
    phone: '+1 555-000-0000',
    mail: 'a@example.com',
  }],
}];
const BIG_DEPARTMENTS_COUNT = 20;
const BIG_EMPLOYEES_IN_DEPARTMENT_COUNT = 1000 / BIG_DEPARTMENTS_COUNT;
export const TEST_BIG_DATA: Department[] = Array.from({ length: BIG_DEPARTMENTS_COUNT }, (_, i) => ({
  id: i + 1,
  name: `Department ${i + 1}`,
  employees: Array.from({ length: BIG_EMPLOYEES_IN_DEPARTMENT_COUNT }, (_, k) => ({
    id: 100 * i + k + 1,
    departmentId: i + 1,
    firstName: 'First Name',
    lastName: `Employee ${100 * i + k + 1}`,
    title: Title.Analyst,
    phone: '+1 000-000-0000',
    mail: 'a@b.com',
  })),
}));

export const ID_BELOW_MINIMUM_LIMIT = 0;
export const ID_ABOVE_MAXIMUM_LIMIT = MAX_INT_32 + 1;
export const IDS_OUT_OF_RANGE = [ID_BELOW_MINIMUM_LIMIT, ID_ABOVE_MAXIMUM_LIMIT];

export const TEST_1ST_DEPARTMENT = INITIAL_DATA[0];
export const TEST_2ND_DEPARTMENT = INITIAL_DATA[1];
export const TEST_LAST_DEPARTMENT = INITIAL_DATA[INITIAL_DATA.length - 1];
export const TEST_DEPARTMENT_CREATED = {
  ...TEST_1ST_DEPARTMENT,
  id: 5432101,
  employees: []
};
export const TEST_DEPARTMENT_UPDATED = {
  ...TEST_DEPARTMENT_CREATED,
  name: 'Updated Department Name'
};
export const TEST_DEPARTMENT_MINIMAL: Department = {
  id: 5432102,
  name: 'D',
  employees: [],
};
export const TEST_DEPARTMENT_MAXIMAL: Department = {
  id: 5432103,
  name: 'Ünïcödé Départment 部門 abcd-1234',
  employees: [],
  notes: 'Note line.\n'.repeat(200),
  keywords: Array.from({ length: 40 }, (_, i) => `keyword-${i}`),
  startDate: new Date('1970-01-01T00:00:00.000Z'),
  endDate: new Date('2999-12-31T23:59:59.000Z'),
  image: 'images/' + 'x'.repeat(200) + '.jpg',
};
export const TEST_DEPARTMENT_ID_NOT_EXISTING = Math.max(...INITIAL_DATA.map(dept => dept.id)) + 1;

export const TEST_EMPLOYEES = TEST_DEPARTMENTS.flatMap(dept => dept.employees);
export const TEST_1ST_EMPLOYEE = TEST_1ST_DEPARTMENT.employees[0];
export const TEST_LAST_EMPLOYEE = TEST_LAST_DEPARTMENT.employees[TEST_LAST_DEPARTMENT.employees.length - 1];
export const TEST_ALL_EMPLOYEE_IDS = TEST_1ST_DEPARTMENT.employees.map(emp => emp.id);
export const TEST_EMPLOYEE_CREATED = {
  ...TEST_1ST_EMPLOYEE,
  id: 5432104,
};
export const TEST_EMPLOYEE_UPDATED = {
  ...TEST_EMPLOYEE_CREATED,
  firstName: 'Updated Employee First Name',
  lastName: 'Updated Employee Last Name'
};
export const TEST_EMPLOYEE_MINIMAL: Employee = {
  id: 5432105,
  departmentId: TEST_1ST_DEPARTMENT.id,
  firstName: 'FN',
  lastName: 'LN',
  title: Title.Analyst,
  phone: '+1 000-000-0000',
  mail: 'a@b.com',
};
export const TEST_EMPLOYEE_MAXIMAL: Employee = {
  id: 5432106,
  departmentId: TEST_1ST_DEPARTMENT.id,
  firstName: 'FN-ab12-'.repeat(5),
  lastName: 'LN-ab12-'.repeat(5),
  title: Title.Developer,
  phone: '+00 (000) 000-00-00 ext.99999',
  mail: 'a'.repeat(35) + '@' + 'b'.repeat(40) + '.com',
  streetName: 'ST-ab12-'.repeat(10),
  houseNumber: '012345-ABC'.repeat(2),
  postalCode: '0-123-456-'.repeat(2),
  locality: 'City/With Special-Chars & Ünïcödé 12',
  province: 'Province/With Spec-Chars & Ünïcödé 1',
  country: 'Country/With Spec-Chars & Ünïcödé 12',
};
export const TEST_EMPLOYEE_ID_NOT_EXISTING = Math.max(...INITIAL_DATA.flatMap(dept => dept.employees.map(emp => emp.id))) + 1;
export const TEST_EMPLOYEE_IDS_NOT_EXISTING = [TEST_EMPLOYEE_ID_NOT_EXISTING, TEST_EMPLOYEE_ID_NOT_EXISTING + 1, TEST_EMPLOYEE_ID_NOT_EXISTING + 2];
export const TEST_EMPLOYEE_IDS_OUT_OF_RANGE = new Array(MAX_BATCH_EMPLOYEE_IDS + 1)

export const UNKNOWN_REPOSITORY_TYPE = 'UnknownRepositoryType' as RepositoryType;
