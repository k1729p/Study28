import { Employee } from './employee.js';
export interface Department {
  id: number;
  name: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  keywords?: string[];
  image?: string;
  employees: Employee[];
}
