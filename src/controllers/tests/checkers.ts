import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { INITIAL_DATA } from '../../services/services.constants.js';
import { expect, assert } from "vitest";

/**
 * Checks the actual departments.
 * Used for test assertions.
 * @param expectedDepartments the expected departments
 * @param actualDepartments the actual departments
 * @returns void
 */
export function checkDepartments(expectedDepartments: Department[], actualDepartments: Department[]) {
  assert.isArray(actualDepartments);
  expect(actualDepartments).toHaveLength(expectedDepartments.length);
  const expectedFirstDepartment = expectedDepartments[0];
  const actualFirstDepartment = actualDepartments.find(dep => dep.id === expectedFirstDepartment.id);
  checkDepartment(expectedFirstDepartment, actualFirstDepartment);
  const expectedLastDepartment = expectedDepartments[expectedDepartments.length - 1];
  const actualLastDepartment = actualDepartments.find(dep => dep.id === expectedLastDepartment.id);
  checkDepartment(expectedLastDepartment, actualLastDepartment);
}

/**
 * Checks that the actual department matches the expected department.
 * Used for test assertions.
 * @param expectedDepartment the expected department
 * @param actualDepartment the actual department
 * @returns void
 */
export function checkDepartment(expectedDepartment: Department, actualDepartment: Department | undefined) {
  expect(actualDepartment).toBeDefined();
  expect(actualDepartment?.id).toBe(expectedDepartment.id);
  expect(actualDepartment?.name).toBe(expectedDepartment.name);

  const actualStartDate = new Date(actualDepartment?.startDate ?? Date.now());
  const expectedStartDate = new Date(expectedDepartment.startDate ?? Date.now());
  expect(actualStartDate.getTime()).toEqual(expectedStartDate.getTime());
  const actualEndDate = new Date(actualDepartment?.endDate ?? Date.now());
  const expectedEndDate = new Date(expectedDepartment.endDate ?? Date.now());
  expect(actualEndDate.getTime()).toEqual(expectedEndDate.getTime());

  expectedDepartment.notes ?
    expect(actualDepartment?.notes).toBe(expectedDepartment.notes) :
    expect(actualDepartment?.notes).toBeFalsy;
  expect(actualDepartment?.keywords ?? []).toEqual(expectedDepartment.keywords ?? []);
  expectedDepartment.image ?
    expect(actualDepartment?.image).toBe(expectedDepartment.image) :
    expect(actualDepartment?.image).toBeFalsy();
  const actualEmployees = [...(actualDepartment?.employees ?? [])].sort((a, b) => a.id - b.id);
  const expectedEmployees = [...(expectedDepartment?.employees ?? [])].sort((a, b) => a.id - b.id);  
  expect(actualEmployees).toHaveLength(expectedEmployees.length);
  for (let i = 0; i < (expectedEmployees.length ?? 0); i++) {
    checkEmployee(expectedEmployees[i], actualEmployees[i]);
  }
}

/**
 * Checks the actual employees.
 * Used for test assertions.
 * @param expectedEmployee the expected employee
 * @param actualEmployees the actual employees
 * @returns void
 */
export function checkEmployees(expectedEmployee: Employee, actualEmployees: Employee[]) {
  assert.isArray(actualEmployees);
  expect(actualEmployees).toHaveLength(INITIAL_DATA.length * INITIAL_DATA[0].employees.length);
  const actualEmployee = actualEmployees.find(emp => emp.id === expectedEmployee.id);
  checkEmployee(expectedEmployee, actualEmployee);
}

/**
 * Checks that the actual employee matches the expected employee.
 * Used for test assertions.
 * @param expectedEmployee the expected employee
 * @param actualEmployee the actual employee
 * @returns void
 */
export function checkEmployee(expectedEmployee: Employee, actualEmployee: Employee | undefined) {

  expect(actualEmployee).toBeDefined();
  expect(actualEmployee?.id).toBe(expectedEmployee.id);
  expect(actualEmployee?.departmentId).toBe(expectedEmployee.departmentId);
  expectedEmployee.firstName ?
    expect(actualEmployee?.firstName).toBe(expectedEmployee.firstName) :
    expect(actualEmployee?.firstName).toBeFalsy();
  expectedEmployee.lastName ?
    expect(actualEmployee?.lastName).toBe(expectedEmployee.lastName) :
    expect(actualEmployee?.lastName).toBeFalsy();
  expect(actualEmployee?.title).toBe(expectedEmployee.title);
  expectedEmployee.phone ?
    expect(actualEmployee?.phone).toBe(expectedEmployee.phone) :
    expect(actualEmployee?.phone).toBeFalsy();
  expectedEmployee.mail ?
    expect(actualEmployee?.mail).toBe(expectedEmployee.mail) :
    expect(actualEmployee?.mail).toBeFalsy();
  expectedEmployee.streetName ?
    expect(actualEmployee?.streetName).toBe(expectedEmployee.streetName) :
    expect(actualEmployee?.streetName).toBeFalsy();
  expectedEmployee.houseNumber ?
    expect(actualEmployee?.houseNumber).toBe(expectedEmployee.houseNumber) :
    expect(actualEmployee?.houseNumber).toBeFalsy();
  expectedEmployee.postalCode ?
    expect(actualEmployee?.postalCode).toBe(expectedEmployee.postalCode) :
    expect(actualEmployee?.postalCode).toBeFalsy();
  expectedEmployee.locality ?
    expect(actualEmployee?.locality).toBe(expectedEmployee.locality) :
    expect(actualEmployee?.locality).toBeFalsy();
  expectedEmployee.province ?
    expect(actualEmployee?.province).toBe(expectedEmployee.province) :
    expect(actualEmployee?.province).toBeFalsy();
  expectedEmployee.country ?
    expect(actualEmployee?.country).toBe(expectedEmployee.country) :
    expect(actualEmployee?.country).toBeFalsy();
}
/**
 * Checks successful transfer results.
 * 
 * @param transferredEmployeeIds the transferred employee ids
 * @param actualSourceDepartment the actual source department
 * @param actualTargetDepartment the actual target department
 * @param expectedSrcEmpCount the expected employee count in source department
 * @param expectedTrgEmpCount the expected employee count in target department
 */
export function checkSuccessfulTransfer(transferredEmployeeIds: number[],
  actualSourceDepartment: Department | undefined, actualTargetDepartment: Department | undefined,
  expectedSrcEmpCount: number, expectedTrgEmpCount: number) {

  expect(actualSourceDepartment).toBeDefined();
  expect(actualSourceDepartment?.employees).toHaveLength(expectedSrcEmpCount);
  transferredEmployeeIds.forEach(employeeId => {
    expect(actualSourceDepartment?.employees.find(emp => emp.id === employeeId)).toBeUndefined();
  });
  expect(actualTargetDepartment).toBeDefined();
  expect(actualTargetDepartment?.employees).toHaveLength(expectedTrgEmpCount);
  transferredEmployeeIds.forEach(employeeId => {
    expect(actualTargetDepartment?.employees.find(emp => emp.id === employeeId)).toBeDefined();
  });
}
/**
 * Checks failed transfer results.
 * 
 * @param transferredEmployeeIds the transferred employee ids
 * @param actualSourceDepartment the actual source department
 * @param actualTargetDepartment the actual target department
 * @param expectedSrcEmpCount the expected employee count in source department
 * @param expectedTrgEmpCount the expected employee count in target department
 */
export function checkFailedTransfer(transferredEmployeeIds: number[],
  actualSourceDepartment: Department | undefined, actualTargetDepartment: Department | undefined,
  expectedSrcEmpCount: number, expectedTrgEmpCount: number) {

  expect(actualSourceDepartment).toBeDefined();
  expect(actualSourceDepartment?.employees).toHaveLength(expectedSrcEmpCount);
  transferredEmployeeIds.forEach(employeeId => {
    expect(actualSourceDepartment?.employees.find(emp => emp.id === employeeId)).toBeUndefined();
  });
  expect(actualTargetDepartment).toBeDefined();
  expect(actualTargetDepartment?.employees).toHaveLength(expectedTrgEmpCount);
  transferredEmployeeIds.forEach(employeeId => {
    expect(actualTargetDepartment?.employees.find(emp => emp.id === employeeId)).toBeUndefined();
  });
}

