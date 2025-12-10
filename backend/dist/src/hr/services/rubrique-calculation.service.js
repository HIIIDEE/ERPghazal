"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubriqueCalculationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const formula_engine_service_1 = require("./formula-engine.service");
const payroll_config_service_1 = require("./payroll-config.service");
const client_1 = require("@prisma/client");
let RubriqueCalculationService = class RubriqueCalculationService {
    prisma;
    formulaEngine;
    payrollConfig;
    constructor(prisma, formulaEngine, payrollConfig) {
        this.prisma = prisma;
        this.formulaEngine = formulaEngine;
        this.payrollConfig = payrollConfig;
    }
    async calculateEmployeeRubriques(context) {
        const { employeeId, month, year, baseSalary, hireDate } = context;
        const currentDate = new Date(year, month, 15);
        const diffTime = Math.abs(currentDate.getTime() - new Date(hireDate).getTime());
        const seniorityYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        const ANCIENNETE = this.roundToTwo(seniorityYears);
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
            }
        });
        const contract = activeContract;
        let structureRubriques = [];
        if (contract && contract.salaryStructure) {
            structureRubriques = contract.salaryStructure.rubriques.map((sr) => ({
                id: `struct_${sr.salaryStructureId}_${sr.rubriqueId}`,
                employeeId,
                rubriqueId: sr.rubriqueId,
                rubrique: sr.rubrique,
                startDate: contract.startDate,
                endDate: contract.endDate,
                montantOverride: null,
                tauxOverride: null,
                ordre: sr.ordre
            }));
        }
        const rubriquesMap = new Map();
        structureRubriques.forEach(r => {
            rubriquesMap.set(r.rubriqueId, r);
        });
        individualAssignments.forEach(r => {
            rubriquesMap.set(r.rubriqueId, r);
        });
        const employeeRubriques = Array.from(rubriquesMap.values())
            .sort((a, b) => {
            const orderA = a.ordre || a.rubrique.ordreAffichage || 999;
            const orderB = b.ordre || b.rubrique.ordreAffichage || 999;
            return orderA - orderB;
        });
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
        const params = await this.payrollConfig.getAllParameters(currentDate);
        const results = [];
        const baseRubriques = employeeRubriques.filter(er => er.rubrique.isActive && er.rubrique.type === 'BASE');
        const gainRubriques = employeeRubriques.filter(er => er.rubrique.isActive && er.rubrique.type === 'GAIN');
        const retenueRubriques = employeeRubriques.filter(er => er.rubrique.isActive && er.rubrique.type === 'RETENUE');
        const cotisationRubriques = employeeRubriques.filter(er => er.rubrique.isActive && er.rubrique.type === 'COTISATION');
        for (const empRub of baseRubriques) {
            const rubrique = empRub.rubrique;
            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: baseSalary,
                SALAIRE_IMPOSABLE: baseSalary,
                ANCIENNETE,
                ...params
            };
            let montant = 0;
            try {
                montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);
            }
            catch (error) {
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
        let totalGainsSoumisCotisations = 0;
        let totalGainsNonSoumis = 0;
        for (const empRub of gainRubriques) {
            const rubrique = empRub.rubrique;
            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: baseSalary,
                SALAIRE_IMPOSABLE: baseSalary,
                ANCIENNETE,
                ...params
            };
            let montant = 0;
            try {
                montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);
            }
            catch (error) {
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
            if (rubrique.soumisCnas || rubrique.soumisChargeEmployeur) {
                totalGainsSoumisCotisations += montant;
            }
            else {
                totalGainsNonSoumis += montant;
            }
        }
        const salaireBrutCotisations = baseSalary + totalGainsSoumisCotisations;
        const salaireBrutTotal = baseSalary + totalGainsSoumisCotisations + totalGainsNonSoumis;
        let totalRetenues = 0;
        let runningImposable = salaireBrutCotisations;
        for (const empRub of retenueRubriques) {
            const rubrique = empRub.rubrique;
            const currentIrg = this.calculateIrg(runningImposable, taxBrackets);
            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: salaireBrutCotisations,
                SALAIRE_IMPOSABLE: runningImposable,
                IRG_PROGRESSIF: currentIrg,
                ANCIENNETE,
                ...params
            };
            let montant = 0;
            try {
                montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);
            }
            catch (error) {
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
            if (rubrique.code.includes('SS') || rubrique.code.includes('CNAS')) {
                runningImposable -= montant;
            }
        }
        for (const empRub of cotisationRubriques) {
            const rubrique = empRub.rubrique;
            const formulaContext = {
                SALAIRE_BASE: baseSalary,
                SALAIRE_BRUT: salaireBrutCotisations,
                SALAIRE_IMPOSABLE: salaireBrutTotal - totalRetenues,
                ...params
            };
            let montant = 0;
            try {
                montant = await this.calculateSingleRubrique(rubrique, empRub, formulaContext);
            }
            catch (error) {
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
    async calculateSingleRubrique(rubrique, employeeRubrique, formulaContext) {
        let montant = await this._calculateSingleRubriqueInternal(rubrique, employeeRubrique, formulaContext);
        if (montant === 0 && formulaContext.SALAIRE_BASE > 0) {
            const isBaseSalaryRubrique = rubrique.code === 'SALAIRE_BASE' ||
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
    async _calculateSingleRubriqueInternal(rubrique, employeeRubrique, formulaContext) {
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
                return employeeRubrique.montantOverride
                    ? this.decimalToNumber(employeeRubrique.montantOverride)
                    : 0;
            default:
                return 0;
        }
    }
    async assignRubriqueToEmployee(data) {
        return this.prisma.employeeRubrique.create({
            data: {
                employeeId: data.employeeId,
                rubriqueId: data.rubriqueId,
                startDate: data.startDate,
                endDate: data.endDate,
                montantOverride: data.montantOverride ? new client_1.Prisma.Decimal(data.montantOverride) : null,
                tauxOverride: data.tauxOverride ? new client_1.Prisma.Decimal(data.tauxOverride) : null
            }
        });
    }
    async removeRubriqueFromEmployee(employeeId, rubriqueId) {
        return this.prisma.employeeRubrique.deleteMany({
            where: { employeeId, rubriqueId }
        });
    }
    async getEmployeeRubriques(employeeId) {
        return this.prisma.employeeRubrique.findMany({
            where: { employeeId },
            include: { rubrique: true },
            orderBy: { startDate: 'desc' }
        });
    }
    decimalToNumber(decimal) {
        return parseFloat(decimal.toString());
    }
    roundToTwo(num) {
        return Math.round(num * 100) / 100;
    }
    calculateIrg(salaireImposable, brackets) {
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
        const abatementRate = 0.40;
        const totalAbatement = tax * abatementRate;
        const finalAbatement = Math.min(Math.max(totalAbatement, 1000), 1500);
        if (tax > 0) {
            return Math.max(0, this.roundToTwo(tax - finalAbatement));
        }
        return 0;
    }
};
exports.RubriqueCalculationService = RubriqueCalculationService;
exports.RubriqueCalculationService = RubriqueCalculationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        formula_engine_service_1.FormulaEngineService,
        payroll_config_service_1.PayrollConfigService])
], RubriqueCalculationService);
//# sourceMappingURL=rubrique-calculation.service.js.map