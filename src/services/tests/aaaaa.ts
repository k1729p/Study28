import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";
import { Title } from "../../models/title.js";
import { RepositoryType } from '../../repositories/repository-type.js';
import { InitializationService } from '../initialization.service.js';
import { DepartmentService } from '../department.service.js';
import { EmployeeService } from '../employee.service.js';
import { INITIAL_DATA, MAX_INT_32 } from '../services.constants.js';
import { describe, beforeAll, it, expect, assert } from "vitest";

/**
 * Unit tests for the {@link DepartmentService}.
 *
 * This test suite verifies that the {@link DepartmentService} functions correctly.
 * @param repositoryType the repository type
 */
export function aaaaaTests(repositoryType: RepositoryType) {
  const initializationService = new InitializationService();
  const departmentService = new DepartmentService();
  const employeeService = new EmployeeService();

  const TEST_DEPARTMENT = INITIAL_DATA[0];
  const TEST_EMPLOYEE = INITIAL_DATA[5].employees[4];

  it('should create and retrieve a department with only mandatory fields', async () => {
    // GIVEN
    const expectedDepartment: Department = {
      id: 5432101,
      name: 'D',
      employees: [],
    };
    // WHEN
    await departmentService.createDepartment(repositoryType, expectedDepartment);
    const actualDepartment = await departmentService.getDepartment(repositoryType, expectedDepartment.id);
    // THEN
    // expect(actualDepartment).toBeDefined();
    // expect(actualDepartment?.id).toBe(expectedDepartment.id);
    // expect(actualDepartment?.name).toBe(expectedDepartment.name);
    // expect(actualDepartment?.startDate).toBeFalsy();
    // expect(actualDepartment?.endDate).toBeFalsy();
    // expect(actualDepartment?.notes).toBeFalsy();
//    expect(actualDepartment?.keywords).toEqual([]);
    // expect(actualDepartment?.image).toBeFalsy();
    expect(actualDepartment?.employees).toEqual([]);
    // Cleanup
    await departmentService.deleteDepartment(repositoryType, expectedDepartment.id);
  });


  function checkDepartments(expectedDepartment: Department, actualDepartments: Department[]) {
    assert.isArray(actualDepartments);
    expect(actualDepartments).toHaveLength(INITIAL_DATA.length);
    const actualDepartment = actualDepartments.find(dep => dep.id === expectedDepartment.id);
    checkDepartment(expectedDepartment, actualDepartment);
  }
  function checkDepartment(expectedDepartment: Department, actualDepartment: Department | undefined) {
// console.log('####################################################################### EXPECTED')
// console.log(expectedDepartment?.name)
// console.log(expectedDepartment?.employees)
// console.log('----------------------------------------------------------------------- ACTUAL')
// console.log(actualDepartment?.name)
// console.log(actualDepartment?.employees)
// console.log('#######################################################################')
    expect(actualDepartment).toBeDefined();
    expect(actualDepartment?.id).toBe(expectedDepartment.id);
    expect(actualDepartment?.employees).toHaveLength(expectedDepartment.employees.length);
  }
  function checkEmployee(expectedEmployee: Employee, actualEmployee: Employee | undefined) {
    expect(actualEmployee).toBeDefined();
    expect(actualEmployee?.id).toBe(expectedEmployee.id);
    expect(actualEmployee?.departmentId).toBe(expectedEmployee.departmentId);
    expect(actualEmployee?.firstName).toBe(expectedEmployee.firstName);
    expect(actualEmployee?.lastName).toBe(expectedEmployee.lastName);
    expect(actualEmployee?.title).toBe(expectedEmployee.title);
    expect(actualEmployee?.phone).toBe(expectedEmployee.phone);
    expect(actualEmployee?.mail).toBe(expectedEmployee.mail);
    expect(actualEmployee?.streetName).toBe(expectedEmployee.streetName);
    expect(actualEmployee?.houseNumber).toBe(expectedEmployee.houseNumber);
    expect(actualEmployee?.postalCode).toBe(expectedEmployee.postalCode);
    expect(actualEmployee?.locality).toBe(expectedEmployee.locality);
    expect(actualEmployee?.province).toBe(expectedEmployee.province);
    expect(actualEmployee?.country).toBe(expectedEmployee.country);
  }
}
