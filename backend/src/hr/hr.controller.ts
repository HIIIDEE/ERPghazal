import { Controller, Get, Post, Body, Param, Put, Delete, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { HrService } from './hr.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreatePayrollBonusDto } from './dto/create-payroll-bonus.dto';
import type { Response } from 'express';

@Controller('hr')
export class HrController {
    constructor(private readonly hrService: HrService) { }

    @Post('employees')
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.hrService.createEmployee(createEmployeeDto);
    }

    @Get('employees')
    findAll() {
        return this.hrService.findAllEmployees();
    }

    @Put('employees/:id')
    update(@Param('id') id: string, @Body() updateEmployeeDto: any) {
        return this.hrService.updateEmployee(id, updateEmployeeDto);
    }

    @Get('employees/:id')
    findOne(@Param('id') id: string) {
        return this.hrService.findOneEmployee(id);
    }

    @Get('contracts')
    findAllContracts() {
        return this.hrService.findAllContracts();
    }

    @Post('contracts')
    createContract(@Body() data: any) {
        return this.hrService.createContract(data);
    }

    @Put('contracts/:id')
    updateContract(@Param('id') id: string, @Body() data: any) {
        return this.hrService.updateContract(id, data);
    }

    @Get('positions')
    findAllPositions() {
        return this.hrService.findAllPositions();
    }

    @Get('departments')
    findAllDepartments() {
        return this.hrService.findAllDepartments();
    }

    @Post('positions')
    createPosition(@Body('title') title: string) {
        return this.hrService.createPosition(title);
    }

    @Post('employees/:id/assign-position')
    assignPosition(@Param('id') id: string, @Body() data: { positionId: string, startDate: string }) {
        return this.hrService.assignPosition(id, data.positionId, data.startDate);
    }

    // Bonuses
    @Get('bonuses')
    findAllBonuses() {
        return this.hrService.findAllPayrollBonuses();
    }

    @Post('bonuses')
    createBonus(@Body() body: CreatePayrollBonusDto) {
        return this.hrService.createPayrollBonus(body);
    }

    @Delete('bonuses/:id')
    deleteBonus(@Param('id') id: string) {
        return this.hrService.deletePayrollBonus(id);
    }

    // Absences
    @Post('absences')
    createAbsence(@Body() data: any) {
        return this.hrService.createAbsence(data);
    }

    @Get('employees/:id/absences')
    getAbsences(@Param('id') id: string) {
        return this.hrService.getAbsences(id);
    }

    @Delete('absences/:id')
    deleteAbsence(@Param('id') id: string) {
        return this.hrService.deleteAbsence(id);
    }

    // Absence Reasons
    @Post('absence-reasons')
    createAbsenceReason(@Body() data: any) {
        return this.hrService.createAbsenceReason(data);
    }

    @Get('absence-reasons')
    getAbsenceReasons() {
        return this.hrService.getAbsenceReasons();
    }

    @Delete('absence-reasons/:id')
    deleteAbsenceReason(@Param('id') id: string) {
        return this.hrService.deleteAbsenceReason(id);
    }

    // Monthly Variables
    @Get('variables')
    async getEmployeesWithVariables(@Query('month') month: number, @Query('year') year: number) {
        return this.hrService.getEmployeesWithVariables(Number(month), Number(year));
    }

    @Post('employees/:id/bonuses')
    assignBonus(@Param('id') id: string, @Body() body: { bonusId: string, amount?: number, startDate: string, frequency: 'MONTHLY' | 'PONCTUELLE', endDate?: string }) {
        return this.hrService.assignBonusToEmployee(id, body.bonusId, body);
    }

    @Delete('employees/:id/bonuses/:bonusId')
    removeBonus(@Param('id') id: string, @Param('bonusId') bonusId: string) {
        return this.hrService.removeBonusFromEmployee(id, bonusId);
    }

    @Get('employees/:id/bonuses')
    getEmployeeBonuses(@Param('id') id: string) {
        return this.hrService.getEmployeeBonuses(id);
    }

    // Payslips

    @Post('payslips/simulate')
    async simulatePayslip(@Body() body: { employeeId: string, month: number, year: number }) {
        try {
            return await this.hrService.simulatePayslip(body.employeeId, body.month, body.year);
        } catch (error) {
            throw new HttpException(
                error.message || 'Erreur lors de la simulation',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Post('debug/demo-bonuses')
    async addDemoBonuses() {
        return this.hrService.addDemoBonuses();
    }

    @Get('debug/employees/:name/rubriques')
    async debugEmployeeRubriques(@Param('name') name: string) {
        return this.hrService.debugEmployeeRubriques(name);
    }

    @Post('debug/cleanup-duplicates/:name')
    async cleanupDuplicates(@Param('name') name: string) {
        return this.hrService.cleanupDuplicates(name);
    }

    @Post('debug/rubrique-formulas')
    async debugRubriqueFormulas(@Body() body: { codes: string[] }) {
        return this.hrService.debugRubriqueFormulas(body.codes);
    }

    @Post('debug/fix-structure/:name')
    async fixStructureDuplications(@Param('name') name: string) {
        return this.hrService.fixStructureDuplications(name);
    }

    @Post('debug/update-brackets')
    async updateTaxBrackets() {
        return this.hrService.updateTaxBrackets();
    }

    @Post('debug/remove-cnac/:name')
    async removeCnacFromStructure(@Param('name') name: string) {
        return this.hrService.removeCnacFromStructure(name);
    }

    @Post('debug/fix-base-type')
    async fixBaseType() {
        return this.hrService.fixBaseType();
    }

    @Post('debug/restore-cnac/:name')
    async addCnacToStructure(@Param('name') name: string) {
        return this.hrService.addCnacToStructure(name);
    }











    @Post('payslips/generate')
    async generatePayslips(@Body() body: { employeeIds: string[], month: number, year: number }) {
        try {
            console.log('🔍 [PAYSLIP] Génération demandée pour:', {
                employeeCount: body.employeeIds?.length || 0,
                employeeIds: body.employeeIds,
                month: body.month,
                year: body.year
            });

            const result = await this.hrService.generatePayslips(body.employeeIds, body.month, body.year);

            console.log('✅ [PAYSLIP] Génération réussie:', {
                payslipsGenerated: result?.length || 0
            });

            return result;
        } catch (error) {
            console.error('❌ [PAYSLIP] ERREUR COMPLÈTE lors de la génération:');
            console.error('   Message:', error?.message || 'Aucun message');
            console.error('   Type:', error?.constructor?.name || 'Unknown');
            console.error('   Stack:', error?.stack || 'Pas de stack trace');

            if (error?.response) {
                console.error('   Response:', error.response);
            }

            if (error?.code) {
                console.error('   Code:', error.code);
            }

            if (error?.message && error.message.includes('Erreur de calcul pour la rubrique')) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }

            throw error;
        }
    }

    @Get('payslips')
    getPayslips(@Query('month') month?: string, @Query('year') year?: string) {
        const monthNum = month ? parseInt(month) : undefined;
        const yearNum = year ? parseInt(year) : undefined;
        return this.hrService.getPayslips(monthNum, yearNum);
    }

    @Delete('payslips/:id')
    deletePayslip(@Param('id') id: string) {
        return this.hrService.deletePayslip(id);
    }

    @Get('payslips/:id/pdf')
    async downloadPayslipPDF(@Param('id') id: string, @Res() res: Response) {
        const pdfBuffer = await this.hrService.generatePayslipPDF(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=bulletin-paie-${id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }

    // Social Contributions
    @Get('contributions')
    getContributions() {
        return this.hrService.getAllContributions();
    }

    @Post('contributions')
    createContribution(@Body() data: any) {
        return this.hrService.createContribution(data);
    }

    @Put('contributions/:id')
    updateContribution(@Param('id') id: string, @Body() data: any) {
        return this.hrService.updateContribution(id, data);
    }

    @Get('tax-brackets')
    getTaxBrackets() {
        return this.hrService.findAllTaxBrackets();
    }

    // Employee Rubriques Management
    @Get('employees/:id/rubriques')
    getEmployeeRubriques(@Param('id') id: string) {
        return this.hrService.getEmployeeRubriques(id);
    }

    @Post('employees/:id/rubriques')
    assignRubriqueToEmployee(
        @Param('id') id: string,
        @Body() data: {
            rubriqueId: number;
            montantOverride?: number;
            tauxOverride?: number;
            startDate: string;
            endDate?: string;
        }
    ) {
        return this.hrService.assignRubriqueToEmployee(id, data);
    }

    @Put('employees/:employeeId/rubriques/:rubriqueId')
    updateEmployeeRubrique(
        @Param('employeeId') employeeId: string,
        @Param('rubriqueId') rubriqueId: string,
        @Body() data: {
            montantOverride?: number;
            tauxOverride?: number;
            startDate?: string;
            endDate?: string;
        }
    ) {
        return this.hrService.updateEmployeeRubrique(employeeId, parseInt(rubriqueId), data);
    }

    @Delete('employees/:employeeId/rubriques/:rubriqueId')
    deleteEmployeeRubriqueByIds(
        @Param('employeeId') employeeId: string,
        @Param('rubriqueId') rubriqueId: string
    ) {
        return this.hrService.deleteEmployeeRubrique(employeeId, parseInt(rubriqueId));
    }

    @Get('rubriques')
    getAllRubriques() {
        return this.hrService.getAllRubriques();
    }

}
