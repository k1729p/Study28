import oracledb from 'oracledb';
import { Department } from "../../models/department.js";
import { Employee } from "../../models/employee.js";

export const parametersForDepartment = (department: Department): oracledb.BindParameters => {
  return {
    id: department.id,
    name: department.name,
    startDate: department.startDate ? new Date(department.startDate) : null,
    endDate: department.endDate ? new Date(department.endDate) : null,
    notes: department.notes || null,
    keywords: department.keywords?.join(',') || null,
    image: department.image || null
  };
}
export const parametersForEmployee = (employee: Employee): oracledb.BindParameters => {
  return {
    id: employee.id,
    departmentId: employee.departmentId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    title: employee.title,
    phone: employee.phone,
    mail: employee.mail,
    streetName: employee.streetName || null,
    houseNumber: employee.houseNumber || null,
    postalCode: employee.postalCode || null,
    locality: employee.locality || null,
    province: employee.province || null,
    country: employee.country || null
  };
}