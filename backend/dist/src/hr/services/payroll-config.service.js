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
exports.PayrollConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PayrollConfigService = class PayrollConfigService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getParameter(code, date = new Date()) {
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
    async getAllParameters(date = new Date()) {
        const params = await this.prisma.payrollParameter.findMany({
            where: {
                startDate: { lte: date },
                OR: [
                    { endDate: null },
                    { endDate: { gte: date } }
                ]
            }
        });
        const result = {};
        for (const param of params) {
            result[param.code] = this.decimalToNumber(param.valeur);
        }
        return result;
    }
    async upsertParameter(data) {
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
                valeur: new client_1.Prisma.Decimal(data.valeur),
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate
            }
        });
    }
    async calculateIRG(taxableSalary, date = new Date()) {
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
                irg = fixedAmount + (taxableSalary - minAmount) * rate;
                break;
            }
            else {
                continue;
            }
        }
        return this.roundToTwo(irg);
    }
    calculateIRGFallback(taxableSalary) {
        if (taxableSalary <= 30000)
            return 0;
        let irg = 0;
        if (taxableSalary <= 120000) {
            irg = (taxableSalary - 30000) * 0.20;
        }
        else if (taxableSalary <= 360000) {
            irg = 18000 + (taxableSalary - 120000) * 0.30;
        }
        else {
            irg = 90000 + (taxableSalary - 360000) * 0.35;
        }
        return this.roundToTwo(irg);
    }
    async initializeDefaultTaxBrackets(startDate = new Date()) {
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
                    minAmount: new client_1.Prisma.Decimal(bracket.minAmount),
                    maxAmount: bracket.maxAmount ? new client_1.Prisma.Decimal(bracket.maxAmount) : null,
                    rate: new client_1.Prisma.Decimal(bracket.rate),
                    fixedAmount: new client_1.Prisma.Decimal(bracket.fixedAmount),
                    ordre: bracket.ordre,
                    startDate
                }
            });
        }
    }
    async initializeDefaultParameters(startDate = new Date()) {
        const params = [
            { code: 'SNMG', nom: 'Salaire National Minimum Garanti', valeur: 20000, description: 'SNMG officiel Algérie' },
            { code: 'PLAFOND_CNAS', nom: 'Plafond CNAS', valeur: 108000, description: 'Plafond mensuel pour cotisations CNAS' },
            { code: 'POINT_INDICE', nom: 'Point Indice', valeur: 75, description: 'Valeur du point indice fonction publique' }
        ];
        for (const param of params) {
            await this.upsertParameter({ ...param, startDate });
        }
    }
    decimalToNumber(decimal) {
        return parseFloat(decimal.toString());
    }
    roundToTwo(num) {
        return Math.round(num * 100) / 100;
    }
};
exports.PayrollConfigService = PayrollConfigService;
exports.PayrollConfigService = PayrollConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollConfigService);
//# sourceMappingURL=payroll-config.service.js.map