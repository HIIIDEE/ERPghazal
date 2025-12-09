import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RubriqueService } from './rubrique.service';
import { Rubrique, Prisma } from '@prisma/client';

@Controller('hr/rubriques')
export class RubriqueController {
    constructor(private readonly rubriqueService: RubriqueService) { }

    @Post()
    create(@Body() data: Prisma.RubriqueCreateInput): Promise<Rubrique> {
        return this.rubriqueService.create(data);
    }

    @Get()
    findAll(): Promise<Rubrique[]> {
        return this.rubriqueService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Rubrique | null> {
        return this.rubriqueService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: Prisma.RubriqueUpdateInput,
    ): Promise<Rubrique> {
        return this.rubriqueService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): Promise<Rubrique> {
        return this.rubriqueService.remove(id);
    }
}
