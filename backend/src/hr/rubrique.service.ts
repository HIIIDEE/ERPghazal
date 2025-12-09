import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Rubrique, RubriqueType, RubriqueMontantType, Prisma } from '@prisma/client';

@Injectable()
export class RubriqueService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.RubriqueCreateInput): Promise<Rubrique> {
        return this.prisma.rubrique.create({
            data,
        });
    }

    async findAll(): Promise<Rubrique[]> {
        return this.prisma.rubrique.findMany({
            orderBy: {
                ordreAffichage: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<Rubrique | null> {
        return this.prisma.rubrique.findUnique({
            where: { id },
        });
    }

    async update(id: number, data: Prisma.RubriqueUpdateInput): Promise<Rubrique> {
        return this.prisma.rubrique.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<Rubrique> {
        return this.prisma.rubrique.delete({
            where: { id },
        });
    }
}
