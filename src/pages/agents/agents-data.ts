export type EmployeeStatus = 'Active' | 'Inactive';
export type EmployeeRole = 'Manager' | 'Sub Manager' | 'Staff';
export type Gender = 'Male' | 'Female' | 'Other';
export type EmploymentType = 'Full-time' | 'Part-time';

export const EMPLOYEE_ROLES: EmployeeRole[] = ['Manager', 'Sub Manager', 'Staff'];
export const GENDERS: Gender[] = ['Male', 'Female', 'Other'];
export const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time'];

export interface Employee {
  /** Stable internal id (used in the detail route). */
  id: string;
  /** Business-facing employee identifier shown in the table. */
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  /** ISO date (YYYY-MM-DD) or empty string when not set. */
  hireDate: string;
  status: EmployeeStatus;
  /** Optional profile photo (data URL or remote URL). Falls back to initials. */
  avatarUrl?: string;
  gender?: Gender;
  /** ISO date (YYYY-MM-DD). */
  dateOfBirth?: string;
  /** National / resident ID number. */
  residentId?: string;
  employmentType?: EmploymentType;
  /** Account credentials. */
  loginId?: string;
  password?: string;
}

export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'e3',
    employeeId: 'EMP-1003',
    fullName: 'James Carter',
    email: 'james.carter@tutustay.com',
    phone: '095885854',
    role: 'Sub Manager',
    hireDate: '2026-05-26',
    status: 'Active',
    gender: 'Male',
    dateOfBirth: '1990-04-12',
    residentId: '12/AB(N)123456',
    employmentType: 'Full-time',
    loginId: 'james.carter',
    password: 'Tutustay@123',
  },
  {
    id: 'e2',
    employeeId: 'EMP-1002',
    fullName: 'Olivia Bennett',
    email: 'olivia.bennett@tutustay.com',
    phone: '9772314165',
    role: 'Staff',
    hireDate: '2001-12-31',
    status: 'Active',
    gender: 'Female',
    dateOfBirth: '1995-08-22',
    residentId: '12/CD(N)223344',
    employmentType: 'Part-time',
    loginId: 'olivia.bennett',
    password: 'Tutustay@123',
  },
  {
    id: 'e1',
    employeeId: 'EMP-1001',
    fullName: 'Ethan Walker',
    email: 'ethan.walker@tutustay.com',
    phone: '0954554545',
    role: 'Manager',
    hireDate: '',
    status: 'Active',
    gender: 'Male',
    dateOfBirth: '1988-01-30',
    residentId: '12/EF(N)556677',
    employmentType: 'Full-time',
    loginId: 'ethan.walker',
    password: 'Tutustay@123',
  },
  {
    id: 'e4',
    employeeId: 'EMP-1004',
    fullName: 'Sophia Turner',
    email: 'sophia.turner@tutustay.com',
    phone: '0911223344',
    role: 'Staff',
    hireDate: '2025-11-02',
    status: 'Inactive',
    gender: 'Female',
    dateOfBirth: '1998-11-05',
    residentId: '12/GH(N)778899',
    employmentType: 'Part-time',
    loginId: 'sophia.turner',
    password: 'Tutustay@123',
  },
  {
    id: 'e5',
    employeeId: 'EMP-1005',
    fullName: 'Liam Hayes',
    email: 'liam.hayes@tutustay.com',
    phone: '0977889900',
    role: 'Sub Manager',
    hireDate: '2024-03-18',
    status: 'Active',
    gender: 'Male',
    dateOfBirth: '1992-06-17',
    residentId: '12/IJ(N)990011',
    employmentType: 'Full-time',
    loginId: 'liam.hayes',
    password: 'Tutustay@123',
  },
  {
    id: 'e6',
    employeeId: 'EMP-1006',
    fullName: 'Emma Brooks',
    email: 'emma.brooks@tutustay.com',
    phone: '0943217788',
    role: 'Staff',
    hireDate: '2025-07-09',
    status: 'Active',
    gender: 'Female',
    dateOfBirth: '1996-03-09',
    residentId: '12/KL(N)112233',
    employmentType: 'Full-time',
    loginId: 'emma.brooks',
    password: 'Tutustay@123',
  },
  {
    id: 'e7',
    employeeId: 'EMP-1007',
    fullName: 'Noah Mitchell',
    email: 'noah.mitchell@tutustay.com',
    phone: '0962004411',
    role: 'Manager',
    hireDate: '2023-01-15',
    status: 'Active',
    gender: 'Male',
    dateOfBirth: '1985-09-25',
    residentId: '12/MN(N)334455',
    employmentType: 'Full-time',
    loginId: 'noah.mitchell',
    password: 'Tutustay@123',
  },
  {
    id: 'e8',
    employeeId: 'EMP-1008',
    fullName: 'Ava Coleman',
    email: 'ava.coleman@tutustay.com',
    phone: '0998112233',
    role: 'Staff',
    hireDate: '2025-02-27',
    status: 'Inactive',
    gender: 'Female',
    dateOfBirth: '1999-12-14',
    residentId: '12/OP(N)556677',
    employmentType: 'Part-time',
    loginId: 'ava.coleman',
    password: 'Tutustay@123',
  },
  {
    id: 'e9',
    employeeId: 'EMP-1009',
    fullName: 'Mason Reed',
    email: 'mason.reed@tutustay.com',
    phone: '0934567890',
    role: 'Sub Manager',
    hireDate: '2024-09-01',
    status: 'Active',
    gender: 'Male',
    dateOfBirth: '1991-07-03',
    residentId: '12/QR(N)778800',
    employmentType: 'Full-time',
    loginId: 'mason.reed',
    password: 'Tutustay@123',
  },
];
