import { create } from 'zustand';
import { DEMO_CUSTOMERS, type Customer } from './customers-data';

interface CustomersState {
  customers: Customer[];
  updateCustomer: (customer: Customer) => void;
  setNote: (id: string, notes: string) => void;
  removeCustomer: (id: string) => void;
  getById: (id: string) => Customer | undefined;
}

/** Shared customer store so the list and detail page read/write the same data. */
export const useCustomers = create<CustomersState>((set, get) => ({
  customers: DEMO_CUSTOMERS,
  updateCustomer: (customer) =>
    set((state) => ({ customers: state.customers.map((c) => (c.id === customer.id ? customer : c)) })),
  setNote: (id, notes) =>
    set((state) => ({ customers: state.customers.map((c) => (c.id === id ? { ...c, notes } : c)) })),
  removeCustomer: (id) =>
    set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
  getById: (id) => get().customers.find((c) => c.id === id),
}));
