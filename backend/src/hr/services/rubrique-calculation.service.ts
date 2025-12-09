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
        const { employeeId, month, year, baseSalary } = context;
        const currentDate = new Date(year, month, 15); // Mid-month for date checks

        // Get employee's active rubriques
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


        // Get payroll parameters for formulas
        const params = await this.payrollConfig.getAllParameters(currentDate);

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
                ...params
            };

            const montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);
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
                ...params
            };

            const montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);

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

        for (const empRub of retenueRubriques) {
            const rubrique = empRub.rubrique;
            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: salaireBrutCotisations,  // ← CORRECT: use brut for cotisations
                SALAIRE_IMPOSABLE: salaireBrutTotal,   // ← Will be reduced by retenues
                ...params
            };

            const montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);

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
        }

        // =================================================================================
        // PASS 3: Calculate COTISATIONS PATRONALES (informative only)
        // =================================================================================

        for (const empRub of cotisationRubriques) {
            const rubrique = empRub.rubrique;
            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: salaireBrutCotisations,  // ← Same as employee contributions
                SALAIRE_IMPOSABLE: salaireBrutTotal - totalRetenues,
                ...params
            };

            const montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);

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
     * Calculate a single rubrique amount
     */
    private async calculateSingleRubrique(
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
                    throw new Error(`Rubrique ${rubrique.code} has type FORMULE but no formula defined`);
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
}
