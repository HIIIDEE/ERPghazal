import { PrismaService } from '../../prisma/prisma.service';
import { FormulaEngineService } from './formula-engine.service';
import { PayrollConfigService } from './payroll-config.service';
import { Prisma } from '@prisma/client';
interface RubriqueCalculationContext {
    employeeId: string;
    month: number;
    year: number;
    baseSalary: number;
    grossSalary?: number;
    hireDate: Date;
}
interface CalculatedRubrique {
    code: string;
    nom: string;
    type: string;
    montant: number;
    base?: number;
    taux?: number;
    soumisCnas: boolean;
    soumisIrg: boolean;
    soumisChargeEmployeur: boolean;
}
export declare class RubriqueCalculationService {
    private prisma;
    private formulaEngine;
    private payrollConfig;
    constructor(prisma: PrismaService, formulaEngine: FormulaEngineService, payrollConfig: PayrollConfigService);
    calculateEmployeeRubriques(context: RubriqueCalculationContext): Promise<CalculatedRubrique[]>;
    private calculateSingleRubrique;
    private _calculateSingleRubriqueInternal;
    assignRubriqueToEmployee(data: {
        employeeId: string;
        rubriqueId: number;
        startDate: Date;
        endDate?: Date;
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
        montantOverride: Prisma.Decimal | null;
        tauxOverride: Prisma.Decimal | null;
    }>;
    removeRubriqueFromEmployee(employeeId: string, rubriqueId: number): Promise<Prisma.BatchPayload>;
    getEmployeeRubriques(employeeId: string): Promise<({
        rubrique: {
            id: number;
            code: string;
            nom: string;
            type: import("@prisma/client").$Enums.RubriqueType;
            montantType: import("@prisma/client").$Enums.RubriqueMontantType;
            valeur: Prisma.Decimal | null;
            formule: string | null;
            soumisCnas: boolean;
            soumisIrg: boolean;
            soumisChargeEmployeur: boolean;
            ordreAffichage: number | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        employeeId: string;
        rubriqueId: number;
        montantOverride: Prisma.Decimal | null;
        tauxOverride: Prisma.Decimal | null;
    })[]>;
    private decimalToNumber;
    private roundToTwo;
    private calculateIrg;
}
export {};
