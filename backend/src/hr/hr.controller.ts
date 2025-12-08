import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { HrService } from './hr.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

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
    createBonus(@Body() body: any) {
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



}
