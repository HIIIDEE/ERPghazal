import { create } from 'zustand';
import { api } from '../../lib/api';

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    workEmail: string;
    jobTitle?: string;
    workPhone?: string;
    workMobile?: string;
    hireDate: string;
    // Private Info
    address?: string;
    privateEmail?: string;
    phone?: string;
    nationality?: string;
    maritalStatus?: string;
    gender?: string;
    birthday?: string;
    placeOfBirth?: string;
    countryOfBirth?: string;
    children?: number;
    emergencyContact?: string;
    emergencyPhone?: string;
    bankAccount?: string;

    // Relations
    contracts?: any[];
    department?: { name: string };
    position?: { title: string };
    positionHistory?: any[];
    user?: { email: string };
}

interface EmployeeState {
    employees: Employee[];
    selectedEmployee: Employee | null;
    loading: boolean;
    error: string | null;
    fetchEmployees: () => Promise<void>;
    fetchEmployee: (id: string) => Promise<void>;
    positions: any[];
    createEmployee: (data: any) => Promise<void>;
    createContract: (data: any) => Promise<void>;
    updateContract: (id: string, data: any) => Promise<void>;
    fetchPositions: () => Promise<void>;
    createPosition: (title: string) => Promise<void>;
    assignPosition: (employeeId: string, positionId: string, startDate: string) => Promise<void>;
    updateEmployee: (id: string, data: any) => Promise<void>;
    // Bonus
    payrollBonuses: any[];
    fetchPayrollBonuses: () => Promise<void>;
    createPayrollBonus: (data: { name: string, isCotisable: boolean }) => Promise<void>;
    deletePayrollBonus: (id: string) => Promise<void>;
    // Absences
    absences: any[];
    createAbsence: (data: any) => Promise<void>;
    fetchAbsences: (employeeId: string) => Promise<void>;
    deleteAbsence: (id: string, employeeId: string) => Promise<void>;
    // Absence Reasons
    absenceReasons: any[];
    fetchAbsenceReasons: () => Promise<void>;
    createAbsenceReason: (data: { name: string, isAuthorized: boolean }) => Promise<void>;
    deleteAbsenceReason: (id: string) => Promise<void>;

}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
    employees: [],
    selectedEmployee: null,
    positions: [],
    payrollBonuses: [],
    loading: false,
    error: null,
    fetchEmployees: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/hr/employees');
            set({ employees: response.data, loading: false });
        } catch (error) {
            set({ error: 'Erreur chargement employés', loading: false });
        }
    },
    fetchEmployee: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/hr/employees/${id}`);
            set({ selectedEmployee: response.data, loading: false });
        } catch (error) {
            set({ error: 'Erreur chargement employé', loading: false });
        }
    },
    createEmployee: async (data) => {
        set({ loading: true, error: null });
        try {
            await api.post('/hr/employees', data);
            get().fetchEmployees();
        } catch (error) {
            set({ error: 'Erreur création', loading: false });
            throw error;
        }
    },
    createContract: async (data: any) => {
        set({ loading: true, error: null });
        try {
            await api.post('/hr/contracts', data);
            if (get().selectedEmployee) {
                get().fetchEmployee(get().selectedEmployee!.id);
            }
        } catch (error) {
            set({ error: 'Erreur création contrat', loading: false });
            throw error;
        }
    },
    updateContract: async (id: string, data: any) => {
        set({ loading: true, error: null });
        try {
            await api.put(`/hr/contracts/${id}`, data);
            if (get().selectedEmployee) {
                get().fetchEmployee(get().selectedEmployee!.id);
            }
        } catch (error) {
            set({ error: 'Erreur mise à jour contrat', loading: false });
            throw error;
        }
    },

    // Positions
    fetchPositions: async () => {
        try {
            const res = await api.get('/hr/positions');
            set({ positions: res.data });
        } catch (error) {
            console.error(error);
        }
    },

    createPosition: async (title: string) => {
        try {
            await api.post('/hr/positions', { title });
            get().fetchPositions();
        } catch (error) {
            throw error;
        }
    },

    assignPosition: async (employeeId: string, positionId: string, startDate: string) => {
        try {
            await api.post(`/hr/employees/${employeeId}/assign-position`, { positionId, startDate });
            if (get().selectedEmployee) {
                get().fetchEmployee(employeeId);
            }
        } catch (error) {
            throw error;
        }
    },

    updateEmployee: async (id: string, data: any) => {
        set({ loading: true, error: null });
        try {
            await api.put(`/hr/employees/${id}`, data);
            get().fetchEmployee(id);
        } catch (error) {
            set({ error: 'Erreur mise à jour employé', loading: false });
            throw error;
        }
    },

    // Bonuses
    fetchPayrollBonuses: async () => {
        try {
            const res = await api.get('/hr/bonuses');
            set({ payrollBonuses: res.data });
        } catch (error) {
            console.error(error);
        }
    },

    createPayrollBonus: async (data) => {
        try {
            await api.post('/hr/bonuses', data);
            get().fetchPayrollBonuses();
        } catch (error) {
            throw error;
        }
    },

    deletePayrollBonus: async (id) => {
        try {
            await api.delete(`/hr/bonuses/${id}`);
            get().fetchPayrollBonuses();
        } catch (error) {
            throw error;
        }
    },

    // Absences
    absences: [],
    fetchAbsences: async (employeeId: string) => {
        try {
            const res = await api.get(`/hr/employees/${employeeId}/absences`);
            set({ absences: res.data });
        } catch (error) {
            console.error(error);
        }
    },
    createAbsence: async (data: any) => {
        try {
            await api.post('/hr/absences', data);
            get().fetchAbsences(data.employeeId);
        } catch (error) {
            throw error;
        }
    },
    deleteAbsence: async (id: string, employeeId: string) => {
        try {
            await api.delete(`/hr/absences/${id}`);
            get().fetchAbsences(employeeId);
        } catch (error) {
            throw error;
        }
    },

    // Absence Reasons
    absenceReasons: [],
    fetchAbsenceReasons: async () => {
        try {
            const res = await api.get('/hr/absence-reasons');
            set({ absenceReasons: res.data });
        } catch (error) {
            console.error(error);
        }
    },
    createAbsenceReason: async (data) => {
        try {
            await api.post('/hr/absence-reasons', data);
            get().fetchAbsenceReasons();
        } catch (error) {
            throw error;
        }
    },
    deleteAbsenceReason: async (id) => {
        try {
            await api.delete(`/hr/absence-reasons/${id}`);
            get().fetchAbsenceReasons();
        } catch (error) {
            throw error;
        }
    }
}));
