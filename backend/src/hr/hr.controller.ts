import { Controller, Get, Post, Body, Param, Put, Delete, Query, Res, StreamableFile } from '@nestjs/common';
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
    @Post('payslips/generate')
    generatePayslips(@Body() body: { employeeIds: string[], month: number, year: number }) {
        return this.hrService.generatePayslips(body.employeeIds, body.month, body.year);
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

    @Delete('contributions/:id')
    deleteContribution(@Param('id') id: string) {
        return this.hrService.deleteContribution(id);
    }
}
