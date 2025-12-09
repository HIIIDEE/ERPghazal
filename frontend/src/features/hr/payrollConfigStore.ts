import { create } from 'zustand';

interface PayrollParameter {
    id: string;
    code: string;
    nom: string;
    valeur: number;
    description?: string;
    startDate: string;
    endDate?: string;
}

interface TaxBracket {
    id: string;
    nom: string;
    minAmount: number;
    maxAmount?: number;
    rate: number;
    fixedAmount: number;
    ordre: number;
    startDate: string;
    endDate?: string;
}

interface EmployeeRubrique {
    id: string;
    employeeId: string;
    rubriqueId: number;
    rubrique: {
        id: number;
        code: string;
        nom: string;
        type: string;
        montantType: string;
        valeur?: number;
    };
    montantOverride?: number;
    tauxOverride?: number;
    startDate: string;
    endDate?: string;
}

interface PayrollConfigState {
    parameters: PayrollParameter[];
    taxBrackets: TaxBracket[];
    employeeRubriques: EmployeeRubrique[];

    // Actions - Parameters
    fetchParameters: () => Promise<void>;
    createParameter: (data: Omit<PayrollParameter, 'id'>) => Promise<void>;
    deleteParameter: (id: string) => Promise<void>;
    initializeDefaultParameters: () => Promise<void>;

    // Actions - Tax Brackets
    fetchTaxBrackets: () => Promise<void>;
    createTaxBracket: (data: Omit<TaxBracket, 'id'>) => Promise<void>;
    updateTaxBracket: (id: string, data: Partial<TaxBracket>) => Promise<void>;
    deleteTaxBracket: (id: string) => Promise<void>;
    initializeDefaultTaxBrackets: () => Promise<void>;

    // Actions - Employee Rubriques
    fetchEmployeeRubriques: (employeeId: string) => Promise<void>;
    assignRubriqueToEmployee: (data: {
        employeeId: string;
        rubriqueId: number;
        startDate: string;
        endDate?: string;
        montantOverride?: number;
        tauxOverride?: number;
    }) => Promise<void>;
    removeEmployeeRubrique: (id: string) => Promise<void>;
}

const API_URL = 'http://localhost:3000';

export const usePayrollConfigStore = create<PayrollConfigState>((set, get) => ({
    parameters: [],
    taxBrackets: [],
    employeeRubriques: [],

    // Parameters
    fetchParameters: async () => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/parameters`);
            const data = await response.json();
            set({ parameters: data });
        } catch (error) {
            console.error('Error fetching parameters:', error);
        }
    },

    createParameter: async (data) => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/parameters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                await get().fetchParameters();
            }
        } catch (error) {
            console.error('Error creating parameter:', error);
            throw error;
        }
    },

    deleteParameter: async (id) => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/parameters/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await get().fetchParameters();
            }
        } catch (error) {
            console.error('Error deleting parameter:', error);
            throw error;
        }
    },

    initializeDefaultParameters: async () => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/parameters/initialize-defaults`, {
                method: 'POST'
            });
            if (response.ok) {
                await get().fetchParameters();
            }
        } catch (error) {
            console.error('Error initializing default parameters:', error);
            throw error;
        }
    },

    // Tax Brackets
    fetchTaxBrackets: async () => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/tax-brackets`);
            const data = await response.json();
            set({ taxBrackets: data });
        } catch (error) {
            console.error('Error fetching tax brackets:', error);
        }
    },

    createTaxBracket: async (data) => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/tax-brackets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                await get().fetchTaxBrackets();
            }
        } catch (error) {
            console.error('Error creating tax bracket:', error);
            throw error;
        }
    },

    updateTaxBracket: async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/tax-brackets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                await get().fetchTaxBrackets();
            }
        } catch (error) {
            console.error('Error updating tax bracket:', error);
            throw error;
        }
    },

    deleteTaxBracket: async (id) => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/tax-brackets/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await get().fetchTaxBrackets();
            }
        } catch (error) {
            console.error('Error deleting tax bracket:', error);
            throw error;
        }
    },

    initializeDefaultTaxBrackets: async () => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/tax-brackets/initialize-defaults`, {
                method: 'POST'
            });
            if (response.ok) {
                await get().fetchTaxBrackets();
            }
        } catch (error) {
            console.error('Error initializing default tax brackets:', error);
            throw error;
        }
    },

    // Employee Rubriques
    fetchEmployeeRubriques: async (employeeId) => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/employee-rubriques/${employeeId}`);
            const data = await response.json();
            set({ employeeRubriques: data });
        } catch (error) {
            console.error('Error fetching employee rubriques:', error);
        }
    },

    assignRubriqueToEmployee: async (data) => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/employee-rubriques`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok && data.employeeId) {
                await get().fetchEmployeeRubriques(data.employeeId);
            }
        } catch (error) {
            console.error('Error assigning rubrique:', error);
            throw error;
        }
    },

    removeEmployeeRubrique: async (id) => {
        try {
            const response = await fetch(`${API_URL}/hr/payroll-config/employee-rubriques/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                set(state => ({
                    employeeRubriques: state.employeeRubriques.filter(r => r.id !== id)
                }));
            }
        } catch (error) {
            console.error('Error removing employee rubrique:', error);
            throw error;
        }
    }
}));
