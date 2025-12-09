import { PayrollConfigService } from './services/payroll-config.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PayrollConfigController {
    private payrollConfigService;
    private prisma;
    constructor(payrollConfigService: PayrollConfigService, prisma: PrismaService);
    getAllParameters(): Promise<{
        id: string;
        code: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        nom: string;
        valeur: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getActiveParameters(date?: string): Promise<Record<string, number>>;
    getParameter(code: string, date?: string): Promise<{
        code: string;
        value: number;
    }>;
    createParameter(data: {
        code: string;
        nom: string;
        valeur: number;
        description?: string;
        startDate: string;
        endDate?: string;
    }): Promise<{
        id: string;
        code: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        nom: string;
        valeur: import("@prisma/client-runtime-utils").Decimal;
    }>;
    deleteParameter(id: string): Promise<{
        id: string;
        code: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        nom: string;
        valeur: import("@prisma/client-runtime-utils").Decimal;
    }>;
    initializeDefaultParameters(): Promise<{
        message: string;
    }>;
    getAllTaxBrackets(): Promise<{
        id: string;
        rate: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        nom: string;
        minAmount: import("@prisma/client-runtime-utils").Decimal;
        maxAmount: import("@prisma/client-runtime-utils").Decimal | null;
        fixedAmount: import("@prisma/client-runtime-utils").Decimal;
        ordre: number;
    }[]>;
    getActiveTaxBrackets(date?: string): Promise<{
        id: string;
        rate: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        nom: string;
        minAmount: import("@prisma/client-runtime-utils").Decimal;
        maxAmount: import("@prisma/client-runtime-utils").Decimal | null;
        fixedAmount: import("@prisma/client-runtime-utils").Decimal;
        ordre: number;
    }[]>;
    createTaxBracket(data: {
        nom: string;
        minAmount: number;
        maxAmount?: number;
        rate: number;
        fixedAmount: number;
        ordre: number;
        startDate: string;
        endDate?: string;
    }): Promise<{
        id: string;
        rate: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        nom: string;
        minAmount: import("@prisma/client-runtime-utils").Decimal;
        maxAmount: import("@prisma/client-runtime-utils").Decimal | null;
        fixedAmount: import("@prisma/client-runtime-utils").Decimal;
        ordre: number;
    }>;
    updateTaxBracket(id: string, data: {
        nom?: string;
        minAmount?: number;
        maxAmount?: number;
        rate?: number;
        fixedAmount?: number;
        ordre?: number;
        endDate?: string;
    }): Promise<{
        id: string;
        rate: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        nom: string;
        minAmount: import("@prisma/client-runtime-utils").Decimal;
        maxAmount: import("@prisma/client-runtime-utils").Decimal | null;
        fixedAmount: import("@prisma/client-runtime-utils").Decimal;
        ordre: number;
    }>;
    deleteTaxBracket(id: string): Promise<{
        id: string;
        rate: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        nom: string;
        minAmount: import("@prisma/client-runtime-utils").Decimal;
        maxAmount: import("@prisma/client-runtime-utils").Decimal | null;
        fixedAmount: import("@prisma/client-runtime-utils").Decimal;
        ordre: number;
    }>;
    initializeDefaultTaxBrackets(): Promise<{
        message: string;
    }>;
    calculateIRG(data: {
        taxableSalary: number;
        date?: string;
    }): Promise<{
        taxableSalary: number;
        irg: number;
    }>;
    getEmployeeRubriques(employeeId: string): Promise<({
        rubrique: {
            id: number;
            code: string;
            type: import("@prisma/client").$Enums.RubriqueType;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            nom: string;
            valeur: import("@prisma/client-runtime-utils").Decimal | null;
            montantType: import("@prisma/client").$Enums.RubriqueMontantType;
            formule: string | null;
            soumisCnas: boolean;
            soumisIrg: boolean;
            soumisChargeEmployeur: boolean;
            ordreAffichage: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        employeeId: string;
        rubriqueId: number;
        montantOverride: import("@prisma/client-runtime-utils").Decimal | null;
        tauxOverride: import("@prisma/client-runtime-utils").Decimal | null;
    })[]>;
    assignRubriqueToEmployee(data: {
        employeeId: string;
        rubriqueId: number;
        startDate: string;
        endDate?: string;
        montantOverride?: number;
        tauxOverride?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        employeeId: string;
        rubriqueId: number;
        montantOverride: import("@prisma/client-runtime-utils").Decimal | null;
        tauxOverride: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    removeEmployeeRubrique(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        employeeId: string;
        rubriqueId: number;
        montantOverride: import("@prisma/client-runtime-utils").Decimal | null;
        tauxOverride: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
}
