import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PayrollConfigService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get active payroll parameter value by code
     */
    async getParameter(code: string, date: Date = new Date()): Promise<number> {
        const param = await this.prisma.payrollParameter.findFirst({
            where: {
                code,
                startDate: { lte: date },
                OR: [
                    { endDate: null },
                    { endDate: { gte: date } }
                ]
            },
            orderBy: { startDate: 'desc' }
        });

        if (!param) {
            throw new Error(`Payroll parameter not found: ${code}`);
        }

        return this.decimalToNumber(param.valeur);
    }

    /**
     * Get all active parameters as a map
     */
    async getAllParameters(date: Date = new Date()): Promise<Record<string, number>> {
        const params = await this.prisma.payrollParameter.findMany({
            where: {
                startDate: { lte: date },
                OR: [
                    { endDate: null },
                    { endDate: { gte: date } }
                ]
            }
        });

        const result: Record<string, number> = {};
        for (const param of params) {
            result[param.code] = this.decimalToNumber(param.valeur);
        }

        return result;
    }

    /**
     * Create or update a parameter
     */
    async upsertParameter(data: {
        code: string;
        nom: string;
        valeur: number;
        description?: string;
        startDate: Date;
        endDate?: Date;
    }) {
        // Close previous parameter with same code if exists
        await this.prisma.payrollParameter.updateMany({
            where: {
                code: data.code,
                endDate: null
            },
            data: {
                endDate: data.startDate
            }
        });

        return this.prisma.payrollParameter.create({
            data: {
                code: data.code,
                nom: data.nom,
                valeur: new Prisma.Decimal(data.valeur),
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate
            }
        });
    }

    /**
     * Calculate IRG using active tax brackets
     */
    async calculateIRG(taxableSalary: number, date: Date = new Date()): Promise<number> {
        const brackets = await this.prisma.taxBracket.findMany({
            where: {
                startDate: { lte: date },
                OR: [
                    { endDate: null },
                    { endDate: { gte: date } }
                ]
            },
            orderBy: { ordre: 'asc' }
        });

        if (brackets.length === 0) {
            // Fallback to hardcoded brackets if none configured
            return this.calculateIRGFallback(taxableSalary);
        }

        let irg = 0;

        for (const bracket of brackets) {
            const minAmount = this.decimalToNumber(bracket.minAmount);
            const maxAmount = bracket.maxAmount ? this.decimalToNumber(bracket.maxAmount) : Infinity;
            const rate = this.decimalToNumber(bracket.rate) / 100;
            const fixedAmount = this.decimalToNumber(bracket.fixedAmount);

            if (taxableSalary <= minAmount) {
                break;
            }

            if (taxableSalary <= maxAmount) {
                // Partial bracket
                irg = fixedAmount + (taxableSalary - minAmount) * rate;
                break;
            } else {
                // Full bracket, continue to next
                continue;
            }
        }

        return this.roundToTwo(irg);
    }

    /**
     * Fallback IRG calculation (hardcoded Algerian brackets 2024)
     */
    private calculateIRGFallback(taxableSalary: number): number {
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
     * Initialize default Algerian tax brackets (2024)
     */
    async initializeDefaultTaxBrackets(startDate: Date = new Date()) {
        const brackets = [
            {
                nom: 'Tranche 0 (Exonéré)',
                minAmount: 0,
                maxAmount: 30000,
                rate: 0,
                fixedAmount: 0,
                ordre: 1
            },
            {
                nom: 'Tranche 1',
                minAmount: 30000,
                maxAmount: 120000,
                rate: 20,
                fixedAmount: 0,
                ordre: 2
            },
            {
                nom: 'Tranche 2',
                minAmount: 120000,
                maxAmount: 360000,
                rate: 30,
                fixedAmount: 18000,
                ordre: 3
            },
            {
                nom: 'Tranche 3',
                minAmount: 360000,
                maxAmount: null,
                rate: 35,
                fixedAmount: 90000,
                ordre: 4
            }
        ];

        for (const bracket of brackets) {
            await this.prisma.taxBracket.create({
                data: {
                    nom: bracket.nom,
                    minAmount: new Prisma.Decimal(bracket.minAmount),
                    maxAmount: bracket.maxAmount ? new Prisma.Decimal(bracket.maxAmount) : null,
                    rate: new Prisma.Decimal(bracket.rate),
                    fixedAmount: new Prisma.Decimal(bracket.fixedAmount),
                    ordre: bracket.ordre,
                    startDate
                }
            });
        }
    }

    /**
     * Initialize default payroll parameters
     */
    async initializeDefaultParameters(startDate: Date = new Date()) {
        const params = [
            { code: 'SNMG', nom: 'Salaire National Minimum Garanti', valeur: 20000, description: 'SNMG officiel Algérie' },
            { code: 'PLAFOND_CNAS', nom: 'Plafond CNAS', valeur: 108000, description: 'Plafond mensuel pour cotisations CNAS' },
            { code: 'POINT_INDICE', nom: 'Point Indice', valeur: 75, description: 'Valeur du point indice fonction publique' }
        ];

        for (const param of params) {
            await this.upsertParameter({ ...param, startDate });
        }
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
