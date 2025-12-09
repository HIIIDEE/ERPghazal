import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { SalaryStructureService } from './salary-structure.service';

@Controller('hr/salary-structures')
export class SalaryStructureController {
    constructor(private readonly salaryStructureService: SalaryStructureService) { }

    @Post()
    create(@Body() createDto: { name: string; description?: string }) {
        return this.salaryStructureService.create(createDto);
    }

    @Get()
    findAll() {
        return this.salaryStructureService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salaryStructureService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: { name?: string; description?: string; isActive?: boolean }) {
        return this.salaryStructureService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.salaryStructureService.remove(id);
    }

    @Post(':id/rubriques')
    addRubrique(
        @Param('id') id: string,
        @Body() body: { rubriqueId: number; ordre: number }
    ) {
        return this.salaryStructureService.addRubriqueToStructure(id, body.rubriqueId, body.ordre);
    }

    @Delete(':id/rubriques/:rubriqueId')
    removeRubrique(
        @Param('id') id: string,
        @Param('rubriqueId', ParseIntPipe) rubriqueId: number
    ) {
        return this.salaryStructureService.removeRubriqueFromStructure(id, rubriqueId);
    }
}
