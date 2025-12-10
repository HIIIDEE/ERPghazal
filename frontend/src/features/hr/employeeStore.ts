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
    workLocation?: string;
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

    // CNAS
    socialSecurityNumber?: string;
    cnasAgency?: string;
    cnasStartDate?: string;
    isHandicapped?: boolean;
    cnasContribution?: boolean;
    cnasRateSalary?: string;
    cnasRatePatron?: string;
    cnasRateSocial?: string;
    cnasRateHousing?: string;
    cnasRateCacobath?: string;
    cnasRateService?: string;
    cnasMutual?: string;

    // Relations
    contracts?: any[];
    departmentId?: string;
    department?: { id: string, name: string };
    positionId?: string;
    position?: { id: string, title: string };
    positionHistory?: any[];
    user?: { email: string };
    bonuses?: {
        id: string;
        bonusId: string;
        amount?: number;
        percentage?: number;
        startDate: string;
        endDate?: string;
        frequency: 'MONTHLY' | 'PONCTUELLE';
        bonus?: {
            id: string;
            name: string;
            calculationMode: 'FIXE' | 'POURCENTAGE';
            amount?: number;
            percentage?: number;
        };
    }[];
    // Rubriques
    rubriques?: any[];
}

export interface Rubrique {
    id: number;
    code: string;
    nom: string;
    type: 'GAIN' | 'RETENUE' | 'COTISATION' | 'BASE';
    montantType: 'FIXE' | 'POURCENTAGE' | 'FORMULE' | 'SAISIE';
    valeur?: number;
    formule?: string;
    soumisCnas: boolean;
    soumisIrg: boolean;
    soumisChargeEmployeur: boolean;
    ordreAffichage?: number;
}

export interface SalaryStructure {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    _count?: {
        rubriques: number;
    };
    rubriques?: {
        rubrique: Rubrique;
        ordre: number;
    }[];
}

interface EmployeeState {
    employees: Employee[];
    selectedEmployee: Employee | null;
    loading: boolean;
    error: string | null;
    fetchEmployees: () => Promise<void>;
    fetchContracts: () => Promise<void>;
    contracts: any[];
    fetchEmployee: (id: string) => Promise<void>;
    positions: any[];
    departments: any[];
    createEmployee: (data: any) => Promise<void>;
    createContract: (data: any) => Promise<void>;
    updateContract: (id: string, data: any) => Promise<void>;
    fetchPositions: () => Promise<void>;
    createPosition: (title: string) => Promise<void>;
    fetchDepartments: () => Promise<void>;
    assignPosition: (employeeId: string, positionId: string, startDate: string) => Promise<void>;
    updateEmployee: (id: string, data: any) => Promise<void>;
    // Bonus
    payrollBonuses: any[];
    fetchPayrollBonuses: () => Promise<void>;
    createPayrollBonus: (data: { name: string, calculationMode: 'FIXE' | 'POURCENTAGE', amount?: number, percentage?: number, description?: string }) => Promise<void>;
    deletePayrollBonus: (id: string) => Promise<void>;
    assignBonus: (employeeId: string, bonusId: string, details?: { amount?: number, startDate: string, frequency: 'MONTHLY' | 'PONCTUELLE', endDate?: string }) => Promise<void>;
    removeBonus: (employeeId: string, bonusId: string) => Promise<void>;
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
    // Payslips
    payslips: any[];
    generatePayslips: (employeeIds: string[], month: number, year: number) => Promise<void>;
    fetchPayslips: (month?: number, year?: number) => Promise<void>;
    deletePayslip: (id: string) => Promise<void>;
    simulatePayslip: (employeeId: string, month: number, year: number) => Promise<any>;
    // Rubriques
    rubriques: Rubrique[];
    fetchRubriques: () => Promise<void>;
    createRubrique: (data: any) => Promise<void>;
    updateRubrique: (id: number, data: any) => Promise<void>;
    deleteRubrique: (id: number) => Promise<void>;
    // Salary Structures
    salaryStructures: SalaryStructure[];
    fetchSalaryStructures: () => Promise<void>;
    createSalaryStructure: (data: any) => Promise<void>;
    updateSalaryStructure: (id: string, data: any) => Promise<void>;
    deleteSalaryStructure: (id: string) => Promise<void>;
    addRubriqueToStructure: (structureId: string, rubriqueId: number, ordre: number) => Promise<void>;
    removeRubriqueFromStructure: (structureId: string, rubriqueId: number) => Promise<void>;

    // Monthly Variables
    monthlyVariablesEmployees: any[];
    fetchMonthlyVariables: (month: number, year: number) => Promise<void>;
    assignMonthlyVariable: (employeeId: string, rubriqueId: number, data: any) => Promise<void>;
    deleteEmployeeRubrique: (employeeId: string, rubriqueId: number) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
    employees: [],
    selectedEmployee: null,
    positions: [],
    departments: [],
    payrollBonuses: [],
    rubriques: [],
    salaryStructures: [],
    monthlyVariablesEmployees: [],
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
    contracts: [],
    fetchContracts: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/hr/contracts');
            set({ contracts: response.data, loading: false });
        } catch (error) {
            set({ error: 'Erreur chargement contrats', loading: false });
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

    fetchDepartments: async () => {
        try {
            const res = await api.get('/hr/departments');
            set({ departments: res.data });
        } catch (error) {
            console.error(error);
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

    assignBonus: async (employeeId, bonusId, details) => {
        try {
            await api.post(`/hr/employees/${employeeId}/bonuses`, { bonusId, ...details });
            get().fetchEmployee(employeeId); // Refresh employee to see new bonus
        } catch (error) {
            throw error;
        }
    },

    removeBonus: async (employeeId, bonusId) => {
        try {
            await api.delete(`/hr/employees/${employeeId}/bonuses/${bonusId}`);
            get().fetchEmployee(employeeId); // Refresh employee
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
    },
    // Payslips
    payslips: [],
    generatePayslips: async (employeeIds, month, year) => {
        try {
            await api.post('/hr/payslips/generate', { employeeIds, month, year });
            get().fetchPayslips(month, year);
        } catch (error) {
            throw error;
        }
    },
    fetchPayslips: async (month, year) => {
        try {
            const params: any = {};
            if (month !== undefined) params.month = month;
            if (year !== undefined) params.year = year;
            const res = await api.get('/hr/payslips', { params });
            set({ payslips: res.data });
        } catch (error) {
            console.error(error);
        }
    },
    deletePayslip: async (id) => {
        try {
            await api.delete(`/hr/payslips/${id}`);
            get().fetchPayslips();
        } catch (error) {
            throw error;
        }
    },
    simulatePayslip: async (employeeId, month, year) => {
        try {
            const res = await api.post('/hr/payslips/simulate', { employeeId, month, year });
            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    // Rubriques
    fetchRubriques: async () => {
        try {
            const res = await api.get('/hr/rubriques');
            set({ rubriques: res.data });
        } catch (error) {
            console.error(error);
        }
    },
    createRubrique: async (data) => {
        try {
            await api.post('/hr/rubriques', data);
            get().fetchRubriques();
        } catch (error) {
            throw error;
        }
    },
    updateRubrique: async (id, data) => {
        try {
            await api.put(`/hr/rubriques/${id}`, data);
            get().fetchRubriques();
        } catch (error) {
            throw error;
        }
    },
    deleteRubrique: async (id) => {
        try {
            await api.delete(`/hr/rubriques/${id}`);
            get().fetchRubriques();
        } catch (error) {
            throw error;
        }
    },
    // Salary Structures
    fetchSalaryStructures: async () => {
        try {
            const res = await api.get('/hr/salary-structures');
            set({ salaryStructures: res.data });
        } catch (error) {
            console.error(error);
        }
    },
    createSalaryStructure: async (data) => {
        try {
            await api.post('/hr/salary-structures', data);
            get().fetchSalaryStructures();
        } catch (error) {
            throw error;
        }
    },
    updateSalaryStructure: async (id, data) => {
        try {
            await api.put(`/hr/salary-structures/${id}`, data);
            get().fetchSalaryStructures();
        } catch (error) {
            throw error;
        }
    },
    deleteSalaryStructure: async (id) => {
        try {
            await api.delete(`/hr/salary-structures/${id}`);
            get().fetchSalaryStructures();
        } catch (error) {
            throw error;
        }
    },
    addRubriqueToStructure: async (structureId, rubriqueId, ordre) => {
        try {
            await api.post(`/hr/salary-structures/${structureId}/rubriques`, { rubriqueId, ordre });
            get().fetchSalaryStructures(); // Refresh list to update counts/details
        } catch (error) {
            throw error;
        }
    },
    removeRubriqueFromStructure: async (structureId, rubriqueId) => {
        try {
            await api.delete(`/hr/salary-structures/${structureId}/rubriques/${rubriqueId}`);
            get().fetchSalaryStructures();
        } catch (error) {
            throw error;
        }
    },

    // Monthly Variables
    fetchMonthlyVariables: async (month, year) => {
        try {
            const res = await api.get('/hr/variables', { params: { month, year } });
            set({ monthlyVariablesEmployees: res.data });
        } catch (error) {
            console.error(error);
        }
    },
    assignMonthlyVariable: async (employeeId, rubriqueId, data) => {
        try {
            await api.post(`/hr/employees/${employeeId}/rubriques`, {
                rubriqueId,
                ...data
            });
            // Don't refresh whole list immediately, let the component handle it or refresh
        } catch (error) {
            throw error;
        }
    },
    deleteEmployeeRubrique: async (employeeId, rubriqueId) => {
        try {
            await api.delete(`/hr/employees/${employeeId}/rubriques/${rubriqueId}`);
        } catch (error) {
            throw error;
        }
    }
}));
