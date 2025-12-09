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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollConfigController = void 0;
const common_1 = require("@nestjs/common");
const payroll_config_service_1 = require("./services/payroll-config.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PayrollConfigController = class PayrollConfigController {
    payrollConfigService;
    prisma;
    constructor(payrollConfigService, prisma) {
        this.payrollConfigService = payrollConfigService;
        this.prisma = prisma;
    }
    async getAllParameters() {
        return this.prisma.payrollParameter.findMany({
            orderBy: [
                { code: 'asc' },
                { startDate: 'desc' }
            ]
        });
    }
    async getActiveParameters(date) {
        const targetDate = date ? new Date(date) : new Date();
        return this.payrollConfigService.getAllParameters(targetDate);
    }
    async getParameter(code, date) {
        const targetDate = date ? new Date(date) : new Date();
        const value = await this.payrollConfigService.getParameter(code, targetDate);
        return { code, value };
    }
    async createParameter(data) {
        return this.payrollConfigService.upsertParameter({
            code: data.code,
            nom: data.nom,
            valeur: data.valeur,
            description: data.description,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : undefined
        });
    }
    async deleteParameter(id) {
        return this.prisma.payrollParameter.delete({ where: { id } });
    }
    async initializeDefaultParameters() {
        await this.payrollConfigService.initializeDefaultParameters();
        return { message: 'Default parameters initialized' };
    }
    async getAllTaxBrackets() {
        return this.prisma.taxBracket.findMany({
            orderBy: [
                { startDate: 'desc' },
                { ordre: 'asc' }
            ]
        });
    }
    async getActiveTaxBrackets(date) {
        const targetDate = date ? new Date(date) : new Date();
        return this.prisma.taxBracket.findMany({
            where: {
                startDate: { lte: targetDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: targetDate } }
                ]
            },
            orderBy: { ordre: 'asc' }
        });
    }
    async createTaxBracket(data) {
        return this.prisma.taxBracket.create({
            data: {
                nom: data.nom,
                minAmount: data.minAmount,
                maxAmount: data.maxAmount,
                rate: data.rate,
                fixedAmount: data.fixedAmount,
                ordre: data.ordre,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null
            }
        });
    }
    async updateTaxBracket(id, data) {
        return this.prisma.taxBracket.update({
            where: { id },
            data: {
                ...data,
                endDate: data.endDate ? new Date(data.endDate) : undefined
            }
        });
    }
    async deleteTaxBracket(id) {
        return this.prisma.taxBracket.delete({ where: { id } });
    }
    async initializeDefaultTaxBrackets() {
        await this.payrollConfigService.initializeDefaultTaxBrackets();
        return { message: 'Default tax brackets initialized' };
    }
    async calculateIRG(data) {
        const targetDate = data.date ? new Date(data.date) : new Date();
        const irg = await this.payrollConfigService.calculateIRG(data.taxableSalary, targetDate);
        return { taxableSalary: data.taxableSalary, irg };
    }
    async getEmployeeRubriques(employeeId) {
        return this.prisma.employeeRubrique.findMany({
            where: { employeeId },
            include: { rubrique: true },
            orderBy: { startDate: 'desc' }
        });
    }
    async assignRubriqueToEmployee(data) {
        return this.prisma.employeeRubrique.create({
            data: {
                employeeId: data.employeeId,
                rubriqueId: data.rubriqueId,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                montantOverride: data.montantOverride,
                tauxOverride: data.tauxOverride
            }
        });
    }
    async removeEmployeeRubrique(id) {
        return this.prisma.employeeRubrique.delete({ where: { id } });
    }
};
exports.PayrollConfigController = PayrollConfigController;
__decorate([
    (0, common_1.Get)('parameters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "getAllParameters", null);
__decorate([
    (0, common_1.Get)('parameters/active'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "getActiveParameters", null);
__decorate([
    (0, common_1.Get)('parameters/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "getParameter", null);
__decorate([
    (0, common_1.Post)('parameters'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "createParameter", null);
__decorate([
    (0, common_1.Delete)('parameters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "deleteParameter", null);
__decorate([
    (0, common_1.Post)('parameters/initialize-defaults'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "initializeDefaultParameters", null);
__decorate([
    (0, common_1.Get)('tax-brackets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "getAllTaxBrackets", null);
__decorate([
    (0, common_1.Get)('tax-brackets/active'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "getActiveTaxBrackets", null);
__decorate([
    (0, common_1.Post)('tax-brackets'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "createTaxBracket", null);
__decorate([
    (0, common_1.Put)('tax-brackets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "updateTaxBracket", null);
__decorate([
    (0, common_1.Delete)('tax-brackets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "deleteTaxBracket", null);
__decorate([
    (0, common_1.Post)('tax-brackets/initialize-defaults'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "initializeDefaultTaxBrackets", null);
__decorate([
    (0, common_1.Post)('tax-brackets/calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "calculateIRG", null);
__decorate([
    (0, common_1.Get)('employee-rubriques/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "getEmployeeRubriques", null);
__decorate([
    (0, common_1.Post)('employee-rubriques'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "assignRubriqueToEmployee", null);
__decorate([
    (0, common_1.Delete)('employee-rubriques/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollConfigController.prototype, "removeEmployeeRubrique", null);
exports.PayrollConfigController = PayrollConfigController = __decorate([
    (0, common_1.Controller)('hr/payroll-config'),
    __metadata("design:paramtypes", [payroll_config_service_1.PayrollConfigService,
        prisma_service_1.PrismaService])
], PayrollConfigController);
//# sourceMappingURL=payroll-config.controller.js.map