import { Injectable } from '@nestjs/common';
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

@Injectable()
export class RubriqueCalculationService {
    constructor(
        private prisma: PrismaService,
        private formulaEngine: FormulaEngineService,
        private payrollConfig: PayrollConfigService
    ) { }

    /**
     * Calculate all rubriques for an employee
     * Uses TWO-PASS algorithm for correct Algerian payroll calculation:
     * PASS 1: Calculate GAINS to determine true SALAIRE_BRUT
     * PASS 2: Calculate RETENUES using the correct SALAIRE_BRUT
     */
    async calculateEmployeeRubriques(context: RubriqueCalculationContext): Promise<CalculatedRubrique[]> {
        const { employeeId, month, year, baseSalary, hireDate } = context;
        const currentDate = new Date(year, month, 15); // Mid-month for date checks

        // Calculate Seniority (Ancienneté) in years
        const diffTime = Math.abs(currentDate.getTime() - new Date(hireDate).getTime());
        const seniorityYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        const ANCIENNETE = this.roundToTwo(seniorityYears);

        // Get employee's active rubriques (Individual assignments)
        const individualAssignments = await this.prisma.employeeRubrique.findMany({
            where: {
                employeeId,
                startDate: { lte: currentDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: currentDate } }
                ]
            },
            include: {
                rubrique: true
            }
        });

        // Get Salary Structure rubriques from active contract
        const activeContract = await this.prisma.contract.findFirst({
            where: {
                employeeId,
                status: 'RUNNING',
                startDate: { lte: currentDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: currentDate } }
                ]
            },
            include: {
                salaryStructure: {
                    include: {
                        rubriques: {
                            include: { rubrique: true }
                        }
                    }
                }
            } as any
        });


        const contract: any = activeContract;
        let structureRubriques: any[] = [];
        if (contract && contract.salaryStructure) {
            structureRubriques = contract.salaryStructure.rubriques.map((sr: any) => ({
                id: `struct_${sr.salaryStructureId}_${sr.rubriqueId}`, // virtual ID
                employeeId,
                rubriqueId: sr.rubriqueId,
                rubrique: sr.rubrique,
                startDate: contract.startDate,
                endDate: contract.endDate,
                montantOverride: null,
                tauxOverride: null,
                // Use the order from structure if available, otherwise default
                ordre: sr.ordre
            }));
        }

        // Merge assignments: Individual overrides Structure
        const rubriquesMap = new Map();

        // 1. Add structure rubriques first
        structureRubriques.forEach(r => {
            rubriquesMap.set(r.rubriqueId, r);
        });

        // 2. Add/Override with individual assignments
        individualAssignments.forEach(r => {
            rubriquesMap.set(r.rubriqueId, r);
        });

        const employeeRubriques = Array.from(rubriquesMap.values())
            .sort((a, b) => {
                // Sort by ordreAffichage or structure order
                const orderA = a.ordre || a.rubrique.ordreAffichage || 999;
                const orderB = b.ordre || b.rubrique.ordreAffichage || 999;
                return orderA - orderB;
            });

        // Fetch Tax Brackets
        const taxBrackets = await this.prisma.taxBracket.findMany({
            where: {
                startDate: { lte: currentDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: currentDate } }
                ]
            },
            orderBy: { ordre: 'asc' }
        });


        // Get payroll parameters for formulas
        const params: any = await this.payrollConfig.getAllParameters(currentDate);

        const results: CalculatedRubrique[] = [];

        // =================================================================================
        // PASS 1: Calculate BASE and GAINS to determine SALAIRE_BRUT
        // =================================================================================

        // Separate rubriques by type
        const baseRubriques = employeeRubriques.filter(er => er.rubrique.isActive && er.rubrique.type === 'BASE');
        const gainRubriques = employeeRubriques.filter(er => er.rubrique.isActive && er.rubrique.type === 'GAIN');
        const retenueRubriques = employeeRubriques.filter(er => er.rubrique.isActive && er.rubrique.type === 'RETENUE');
        const cotisationRubriques = employeeRubriques.filter(er => er.rubrique.isActive && er.rubrique.type === 'COTISATION');

        // Calculate BASE rubrique (should be one - the salary base)
        for (const empRub of baseRubriques) {
            const rubrique = empRub.rubrique;
            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: baseSalary, // Not yet calculated
                SALAIRE_IMPOSABLE: baseSalary, // Not yet calculated
                ANCIENNETE, // Inject Seniority
                ...params
            };

            let montant = 0;
            try {
                montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);
            } catch (error) {
                console.error(`Error calculating rubrique ${rubrique.code}:`, error);
                throw new Error(`Erreur de calcul pour la rubrique ${rubrique.code} (${rubrique.nom}): ${error.message}`);
            }
            results.push({
                code: rubrique.code,
                nom: rubrique.nom,
                type: rubrique.type,
                montant,
                soumisCnas: rubrique.soumisCnas,
                soumisIrg: rubrique.soumisIrg,
                soumisChargeEmployeur: rubrique.soumisChargeEmployeur
            });
        }

        // Calculate GAINS to build SALAIRE_BRUT
        let totalGainsSoumisCotisations = 0;
        let totalGainsNonSoumis = 0;

        for (const empRub of gainRubriques) {
            const rubrique = empRub.rubrique;
            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: baseSalary, // Use base for percentage gains
                SALAIRE_IMPOSABLE: baseSalary,
                ANCIENNETE,
                ...params
            };

            let montant = 0;
            try {
                montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);
            } catch (error) {
                console.error(`Error calculating rubrique ${rubrique.code}:`, error);
                throw new Error(`Erreur de calcul pour la rubrique ${rubrique.code} (${rubrique.nom}): ${error.message}`);
            }

            results.push({
                code: rubrique.code,
                nom: rubrique.nom,
                type: rubrique.type,
                montant,
                soumisCnas: rubrique.soumisCnas,
                soumisIrg: rubrique.soumisIrg,
                soumisChargeEmployeur: rubrique.soumisChargeEmployeur
            });

            // Accumulate gains based on whether they're subject to social contributions
            if (rubrique.soumisCnas || rubrique.soumisChargeEmployeur) {
                totalGainsSoumisCotisations += montant;
            } else {
                totalGainsNonSoumis += montant;
            }
        }

        // Calculate true SALAIRE_BRUT (for social contributions calculation)
        // SALAIRE_BRUT = BASE + GAINS soumis à cotisations
        const salaireBrutCotisations = baseSalary + totalGainsSoumisCotisations;

        // SALAIRE_BRUT_TOTAL = BASE + ALL GAINS (for display and other purposes)
        const salaireBrutTotal = baseSalary + totalGainsSoumisCotisations + totalGainsNonSoumis;

        // =================================================================================
        // PASS 2: Calculate RETENUES using the correct SALAIRE_BRUT
        // =================================================================================

        let totalRetenues = 0;
        let runningImposable = salaireBrutCotisations; // Start with S.Brut (assuming only Brut Soumis is used for Calc base)

        // Find SS amount if already in results (unlikely as we are iterating retenues now)
        // But SS is a Retenue.
        // We need to deduct SS from runningImposable BEFORE calculating IRG.
        // Since rubriques are ordered, SS should come before IRG.

        for (const empRub of retenueRubriques) {
            const rubrique = empRub.rubrique;

            // Calculate potential IRG for this step
            const currentIrg = this.calculateIrg(runningImposable, taxBrackets);

            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: salaireBrutCotisations,
                SALAIRE_IMPOSABLE: runningImposable,
                IRG_PROGRESSIF: currentIrg, // Inject calculated IRG
                ANCIENNETE,
                ...params
            };

            let montant = 0;
            try {
                montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);
            } catch (error) {
                console.error(`Error calculating rubrique ${rubrique.code}:`, error);
                throw new Error(`Erreur de calcul pour la rubrique ${rubrique.code} (${rubrique.nom}): ${error.message}`);
            }

            results.push({
                code: rubrique.code,
                nom: rubrique.nom,
                type: rubrique.type,
                montant,
                soumisCnas: rubrique.soumisCnas,
                soumisIrg: rubrique.soumisIrg,
                soumisChargeEmployeur: rubrique.soumisChargeEmployeur
            });

            totalRetenues += montant;

            // If this retenue is "Deductible" (e.g. SS), reduce runningImposable
            // Convention: If code contains SS or CNAS, it's deductible.
            if (rubrique.code.includes('SS') || rubrique.code.includes('CNAS')) {
                runningImposable -= montant;
            }
        }

        // =================================================================================
        // PASS 3: Calculate COTISATIONS PATRONALES (informative only)
        // =================================================================================

        for (const empRub of cotisationRubriques) {
            const rubrique = empRub.rubrique;
            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: salaireBrutCotisations,  // same as employee contributions
                SALAIRE_IMPOSABLE: salaireBrutTotal - totalRetenues,
                ...params
            };

            let montant = 0;
            try {
                montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);
            } catch (error) {
                console.error(`Error calculating rubrique ${rubrique.code}:`, error);
                throw new Error(`Erreur de calcul pour la rubrique ${rubrique.code} (${rubrique.nom}): ${error.message}`);
            }

            results.push({
                code: rubrique.code,
                nom: rubrique.nom,
                type: rubrique.type,
                montant,
                soumisCnas: rubrique.soumisCnas,
                soumisIrg: rubrique.soumisIrg,
                soumisChargeEmployeur: rubrique.soumisChargeEmployeur
            });
        }

        return results;
    }



    /**
     * Calculate a single rubrique amount with fail-safe for Base Salary
     */
    private async calculateSingleRubrique(
        rubrique: any,
        employeeRubrique: any,
        formulaContext: any
    ): Promise<number> {
        let montant = await this._calculateSingleRubriqueInternal(rubrique, employeeRubrique, formulaContext);

        // Fail-safe: If Salaire de Base evaluates to 0 but we have a baseSalary in context, use it.
        // This handles cases where the formula is missing or incorrect for the main base salary rubrique.
        if (montant === 0 && formulaContext.SALAIRE_BASE > 0) {
            const isBaseSalaryRubrique =
                rubrique.code === 'SALAIRE_BASE' ||
                rubrique.code === 'BASE' ||
                rubrique.nom === 'Salaire de Base' ||
                rubrique.nom === 'Salaire de base';

            if (isBaseSalaryRubrique) {
                console.warn(`[RubriqueCalculation] FAIL-SAFE: Forcing value for ${rubrique.code} (${rubrique.nom}) to ${formulaContext.SALAIRE_BASE}`);
                return formulaContext.SALAIRE_BASE;
            }
        }

        return montant;
    }

    private async _calculateSingleRubriqueInternal(
        rubrique: any,
        employeeRubrique: any,
        formulaContext: any
    ): Promise<number> {
        // Check for employee-specific override
        if (employeeRubrique.montantOverride) {
            return this.decimalToNumber(employeeRubrique.montantOverride);
        }

        switch (rubrique.montantType) {
            case 'FIXE':
                return rubrique.valeur ? this.decimalToNumber(rubrique.valeur) : 0;

            case 'POURCENTAGE':
                const taux = employeeRubrique.tauxOverride
                    ? this.decimalToNumber(employeeRubrique.tauxOverride)
                    : rubrique.valeur ? this.decimalToNumber(rubrique.valeur) : 0;
                return this.roundToTwo((formulaContext.SALAIRE_BRUT * taux) / 100);

            case 'FORMULE':
                if (!rubrique.formule) {
                    return 0;
                }
                return this.formulaEngine.evaluate(rubrique.formule, formulaContext);

            case 'SAISIE':
                // Manual entry - should be provided via employeeRubrique override
                return employeeRubrique.montantOverride
                    ? this.decimalToNumber(employeeRubrique.montantOverride)
                    : 0;

            default:
                return 0;
        }
    }

    /**
     * Assign a rubrique to an employee
     */
    async assignRubriqueToEmployee(data: {
        employeeId: string;
        rubriqueId: number;
        startDate: Date;
        endDate?: Date;
        montantOverride?: number;
        tauxOverride?: number;
    }) {
        return this.prisma.employeeRubrique.create({
            data: {
                employeeId: data.employeeId,
                rubriqueId: data.rubriqueId,
                startDate: data.startDate,
                endDate: data.endDate,
                montantOverride: data.montantOverride ? new Prisma.Decimal(data.montantOverride) : null,
                tauxOverride: data.tauxOverride ? new Prisma.Decimal(data.tauxOverride) : null
            }
        });
    }

    /**
     * Remove a rubrique from an employee
     */
    async removeRubriqueFromEmployee(employeeId: string, rubriqueId: number) {
        return this.prisma.employeeRubrique.deleteMany({
            where: { employeeId, rubriqueId }
        });
    }

    /**
     * Get employee's assigned rubriques
     */
    async getEmployeeRubriques(employeeId: string) {
        return this.prisma.employeeRubrique.findMany({
            where: { employeeId },
            include: { rubrique: true },
            orderBy: { startDate: 'desc' }
        });
    }

    /**
     * Convert Prisma Decimal to number
     */
    private decimalToNumber(decimal: Prisma.Decimal): number {
        return parseFloat(decimal.toString());
    }

    /**
     * Round to 2 decimal places
     */
    private roundToTwo(num: number): number {
        return Math.round(num * 100) / 100;
    }

    /**
     * Calculate IRG based on Brackets
     */
    private calculateIrg(salaireImposable: number, brackets: any[]): number {
        // Standard Logic (Abatement on Tax)
        let tax = 0;
        for (const bracket of brackets) {
            const min = this.decimalToNumber(bracket.minAmount);
            const max = bracket.maxAmount ? this.decimalToNumber(bracket.maxAmount) : Infinity;
            const rate = this.decimalToNumber(bracket.rate);

            if (salaireImposable > min) {
                const taxableInThisBracket = Math.min(salaireImposable, max) - min;
                tax += taxableInThisBracket * (rate / 100);
            }
        }

        // Abattement 40% sur l'impôt (Min 1000, Max 1500)
        const abatementRate = 0.40;
        const totalAbatement = tax * abatementRate;
        const finalAbatement = Math.min(Math.max(totalAbatement, 1000), 1500);

        if (tax > 0) {
            return Math.max(0, this.roundToTwo(tax - finalAbatement));
        }

        return 0;
    }
}
