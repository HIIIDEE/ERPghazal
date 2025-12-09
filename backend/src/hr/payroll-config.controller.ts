import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PayrollConfigService } from './services/payroll-config.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('hr/payroll-config')
export class PayrollConfigController {
    constructor(
        private payrollConfigService: PayrollConfigService,
        private prisma: PrismaService
    ) { }

    // ===== PAYROLL PARAMETERS =====

    @Get('parameters')
    async getAllParameters() {
        return this.prisma.payrollParameter.findMany({
            orderBy: [
                { code: 'asc' },
                { startDate: 'desc' }
            ]
        });
    }

    @Get('parameters/active')
    async getActiveParameters(@Query('date') date?: string) {
        const targetDate = date ? new Date(date) : new Date();
        return this.payrollConfigService.getAllParameters(targetDate);
    }

    @Get('parameters/:code')
    async getParameter(
        @Param('code') code: string,
        @Query('date') date?: string
    ) {
        const targetDate = date ? new Date(date) : new Date();
        const value = await this.payrollConfigService.getParameter(code, targetDate);
        return { code, value };
    }

    @Post('parameters')
    async createParameter(@Body() data: {
        code: string;
        nom: string;
        valeur: number;
        description?: string;
        startDate: string;
        endDate?: string;
    }) {
        return this.payrollConfigService.upsertParameter({
            code: data.code,
            nom: data.nom,
            valeur: data.valeur,
            description: data.description,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : undefined
        });
    }

    @Delete('parameters/:id')
    async deleteParameter(@Param('id') id: string) {
        return this.prisma.payrollParameter.delete({ where: { id } });
    }

    @Post('parameters/initialize-defaults')
    async initializeDefaultParameters() {
        await this.payrollConfigService.initializeDefaultParameters();
        return { message: 'Default parameters initialized' };
    }

    // ===== TAX BRACKETS (IRG) =====

    @Get('tax-brackets')
    async getAllTaxBrackets() {
        return this.prisma.taxBracket.findMany({
            orderBy: [
                { startDate: 'desc' },
                { ordre: 'asc' }
            ]
        });
    }

    @Get('tax-brackets/active')
    async getActiveTaxBrackets(@Query('date') date?: string) {
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

    @Post('tax-brackets')
    async createTaxBracket(@Body() data: {
        nom: string;
        minAmount: number;
        maxAmount?: number;
        rate: number;
        fixedAmount: number;
        ordre: number;
        startDate: string;
        endDate?: string;
    }) {
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

    @Put('tax-brackets/:id')
    async updateTaxBracket(
        @Param('id') id: string,
        @Body() data: {
            nom?: string;
            minAmount?: number;
            maxAmount?: number;
            rate?: number;
            fixedAmount?: number;
            ordre?: number;
            endDate?: string;
        }
    ) {
        return this.prisma.taxBracket.update({
            where: { id },
            data: {
                ...data,
                endDate: data.endDate ? new Date(data.endDate) : undefined
            }
        });
    }

    @Delete('tax-brackets/:id')
    async deleteTaxBracket(@Param('id') id: string) {
        return this.prisma.taxBracket.delete({ where: { id } });
    }

    @Post('tax-brackets/initialize-defaults')
    async initializeDefaultTaxBrackets() {
        await this.payrollConfigService.initializeDefaultTaxBrackets();
        return { message: 'Default tax brackets initialized' };
    }

    @Post('tax-brackets/calculate')
    async calculateIRG(@Body() data: { taxableSalary: number; date?: string }) {
        const targetDate = data.date ? new Date(data.date) : new Date();
        const irg = await this.payrollConfigService.calculateIRG(data.taxableSalary, targetDate);
        return { taxableSalary: data.taxableSalary, irg };
    }

    // ===== EMPLOYEE RUBRIQUES =====

    @Get('employee-rubriques/:employeeId')
    async getEmployeeRubriques(@Param('employeeId') employeeId: string) {
        return this.prisma.employeeRubrique.findMany({
            where: { employeeId },
            include: { rubrique: true },
            orderBy: { startDate: 'desc' }
        });
    }

    @Post('employee-rubriques')
    async assignRubriqueToEmployee(@Body() data: {
        employeeId: string;
        rubriqueId: number;
        startDate: string;
        endDate?: string;
        montantOverride?: number;
        tauxOverride?: number;
    }) {
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

    @Delete('employee-rubriques/:id')
    async removeEmployeeRubrique(@Param('id') id: string) {
        return this.prisma.employeeRubrique.delete({ where: { id } });
    }
}
