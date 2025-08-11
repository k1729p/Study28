import { Title } from './title.js';
export interface Employee {
  id: number;
  departmentId: number;
  firstName: string;
  lastName: string;
  title: Title;
  phone: string;
  mail: string;
  streetName?: string;
  houseNumber?: string;
  postalCode?: string;
  locality?: string;
  province?: string;
  country?: string;
}
