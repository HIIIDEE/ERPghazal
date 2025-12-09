interface BonusCalculationParams {
    bonuses: any[];
    baseSalary: number;
    month: number;
    year: number;
}
interface ContributionDetail {
    name: string;
    rate: number;
    amount: number;
}
interface PayslipCalculationResult {
    baseSalary: number;
    bonuses: number;
    grossSalary: number;
    employeeContributions: Record<string, ContributionDetail>;
    totalEmployeeContributions: number;
    taxableSalary: number;
    incomeTax: number;
    netSalary: number;
    employerContributions: Record<string, ContributionDetail>;
    totalEmployerContributions: number;
}
export declare class PayrollCalculationService {
    calculateBonuses({ bonuses, baseSalary, month, year }: BonusCalculationParams): number;
    private calculateBonusValue;
    calculateContributions(contributions: any[], grossSalary: number): {
        details: Record<string, ContributionDetail>;
        total: number;
    };
    calculateIRG(taxableSalary: number): number;
    calculatePayslip(baseSalary: number, totalBonuses: number, employeeContributions: any[], employerContributions: any[]): PayslipCalculationResult;
    private roundToTwo;
}
export {};
