import { useMemo } from 'react';

interface Employee {
    id: string;
    contracts?: any[];
    bonuses?: any[];
}

interface BonusCalculationParams {
    employee: Employee;
    month: number;
    year: number;
}

/**
 * Custom hook for payslip calculations
 * Memoizes calculations to avoid unnecessary re-computations
 */
export function usePayslipCalculation() {
    /**
     * Get active contract for an employee
     */
    const getBaseSalary = useMemo(() => (employee: Employee) => {
        const activeContract = employee.contracts?.find((c: any) =>
            !c.endDate || new Date(c.endDate) > new Date()
        );
        return activeContract ? (activeContract.wage || 0) : 0;
    }, []);

    /**
     * Calculate bonuses for a specific month/year
     */
    const calculateBonuses = useMemo(() => ({ employee, month, year }: BonusCalculationParams) => {
        if (!employee.bonuses) return 0;

        const baseSalary = getBaseSalary(employee);
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        return employee.bonuses.reduce((total: number, eb: any) => {
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
            const value = calculateBonusValue(eb, baseSalary);
            return total + value;
        }, 0);
    }, [getBaseSalary]);

    /**
     * Calculate individual bonus value
     */
    const calculateBonusValue = (employeeBonus: any, baseSalary: number): number => {
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
    };

    /**
     * Calculate estimated net salary (simplified - actual calculation is done server-side)
     */
    const calculateEstimatedNet = useMemo(() => (gross: number) => {
        // This is a simplified estimation
        // Real calculation with IRG and contributions is done in backend
        const employeeContribRate = 0.1625; // 16.25% total
        const afterContribs = gross - (gross * employeeContribRate);

        // Simplified IRG
        let irg = 0;
        if (afterContribs > 30000) {
            if (afterContribs <= 120000) {
                irg = (afterContribs - 30000) * 0.20;
            } else if (afterContribs <= 360000) {
                irg = 18000 + (afterContribs - 120000) * 0.30;
            } else {
                irg = 90000 + (afterContribs - 360000) * 0.35;
            }
        }

        return Math.round(afterContribs - irg);
    }, []);

    return {
        getBaseSalary,
        calculateBonuses,
        calculateEstimatedNet
    };
}
