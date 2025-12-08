import { Injectable } from '@nestjs/common';

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

@Injectable()
export class PayrollCalculationService {
    /**
     * Calculate total bonuses for an employee for a given month
     */
    calculateBonuses({ bonuses, baseSalary, month, year }: BonusCalculationParams): number {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        return bonuses.reduce((total, eb) => {
            const bonusStart = new Date(eb.startDate);
            const bonusEnd = eb.endDate ? new Date(eb.endDate) : null;

            // Filter inactive assignments
            if (bonusStart > endOfMonth || (bonusEnd && bonusEnd < startOfMonth)) {
                return total;
            }

            // Check frequency validity
            const isValid = eb.frequency === 'PONCTUELLE'
                ? bonusStart.getMonth() === month && bonusStart.getFullYear() === year
                : true; // Monthly bonuses are always valid if in date range

            if (!isValid) return total;

            // Calculate bonus value
            const value = this.calculateBonusValue(eb, baseSalary);
            return total + value;
        }, 0);
    }

    /**
     * Calculate individual bonus value
     */
    private calculateBonusValue(employeeBonus: any, baseSalary: number): number {
        // Prefer overridden amount
        if (employeeBonus.amount !== null && employeeBonus.amount !== undefined) {
            return employeeBonus.amount;
        }

        // Fallback to bonus definition
        if (employeeBonus.bonus) {
            if (employeeBonus.bonus.calculationMode === 'FIXE') {
                return employeeBonus.bonus.amount || 0;
            } else {
                return (baseSalary * (employeeBonus.bonus.percentage || 0)) / 100;
            }
        }

        return 0;
    }

    /**
     * Calculate contributions (employee or employer)
     */
    calculateContributions(
        contributions: any[],
        grossSalary: number
    ): { details: Record<string, ContributionDetail>; total: number } {
        const details: Record<string, ContributionDetail> = {};
        let total = 0;

        for (const contrib of contributions) {
            const amount = (grossSalary * contrib.rate) / 100;
            details[contrib.code] = {
                name: contrib.name,
                rate: contrib.rate,
                amount: this.roundToTwo(amount)
            };
            total += amount;
        }

        return { details, total: this.roundToTwo(total) };
    }

    /**
     * Calculate Algerian IRG (income tax) with progressive brackets
     */
    calculateIRG(taxableSalary: number): number {
        if (taxableSalary <= 30000) return 0;

        let irg = 0;
        if (taxableSalary <= 120000) {
            irg = (taxableSalary - 30000) * 0.20;
        } else if (taxableSalary <= 360000) {
            irg = 18000 + (taxableSalary - 120000) * 0.30;
        } else {
            irg = 90000 + (taxableSalary - 360000) * 0.35;
        }

        return this.roundToTwo(irg);
    }

    /**
     * Calculate complete payslip for an employee
     */
    calculatePayslip(
        baseSalary: number,
        totalBonuses: number,
        employeeContributions: any[],
        employerContributions: any[]
    ): PayslipCalculationResult {
        const grossSalary = baseSalary + totalBonuses;

        // Calculate employee contributions (deducted from gross)
        const empContribs = this.calculateContributions(employeeContributions, grossSalary);

        // Calculate taxable salary and IRG
        const taxableSalary = this.roundToTwo(grossSalary - empContribs.total);
        const incomeTax = this.calculateIRG(taxableSalary);
        const netSalary = this.roundToTwo(taxableSalary - incomeTax);

        // Calculate employer contributions (informative only)
        const emplerContribs = this.calculateContributions(employerContributions, grossSalary);

        return {
            baseSalary,
            bonuses: totalBonuses,
            grossSalary,
            employeeContributions: empContribs.details,
            totalEmployeeContributions: empContribs.total,
            taxableSalary,
            incomeTax,
            netSalary,
            employerContributions: emplerContribs.details,
            totalEmployerContributions: emplerContribs.total
        };
    }

    /**
     * Round to 2 decimal places
     */
    private roundToTwo(num: number): number {
        return Math.round(num * 100) / 100;
    }
}
