import { create } from 'zustand';
import { DEMO_EMPLOYEES, type Employee } from './agents-data';

interface EmployeesState {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  getById: (id: string) => Employee | undefined;
}

/**
 * Shared employee store so the list (add/New) and the detail page (Edit)
 * read and write the same data across navigation.
 */
export const useEmployees = create<EmployeesState>((set, get) => ({
  employees: DEMO_EMPLOYEES,
  addEmployee: (employee) =>
    set((state) => ({ employees: [employee, ...state.employees] })),
  updateEmployee: (employee) =>
    set((state) => ({
      employees: state.employees.map((e) => (e.id === employee.id ? employee : e)),
    })),
  removeEmployee: (id) =>
    set((state) => ({ employees: state.employees.filter((e) => e.id !== id) })),
  getById: (id) => get().employees.find((e) => e.id === id),
}));
