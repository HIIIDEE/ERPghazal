import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalaryStructureService {
    constructor(private prisma: PrismaService) { }

    async create(data: { name: string; description?: string }) {
        return (this.prisma as any).salaryStructure.create({
            data,
        });
    }

    async findAll() {
        return (this.prisma as any).salaryStructure.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: { rubriques: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const structure = await (this.prisma as any).salaryStructure.findUnique({
            where: { id },
            include: {
                rubriques: {
                    include: {
                        rubrique: true,
                    },
                    orderBy: {
                        ordre: 'asc',
                    },
                },
            },
        });

        if (!structure) {
            throw new NotFoundException(`Structure with ID ${id} not found`);
        }

        return structure;
    }

    async update(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
        return (this.prisma as any).salaryStructure.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return (this.prisma as any).salaryStructure.delete({
            where: { id },
        });
    }

    async addRubriqueToStructure(structureId: string, rubriqueId: number, ordre: number) {
        // Check if relation exists
        const exists = await (this.prisma as any).structureRubrique.findUnique({
            where: {
                salaryStructureId_rubriqueId: {
                    salaryStructureId: structureId,
                    rubriqueId,
                },
            },
        });

        if (exists) {
            return (this.prisma as any).structureRubrique.update({
                where: {
                    salaryStructureId_rubriqueId: {
                        salaryStructureId: structureId,
                        rubriqueId,
                    },
                },
                data: { ordre },
            });
        }

        return (this.prisma as any).structureRubrique.create({
            data: {
                salaryStructureId: structureId,
                rubriqueId,
                ordre,
            },
        });
    }

    async removeRubriqueFromStructure(structureId: string, rubriqueId: number) {
        return (this.prisma as any).structureRubrique.delete({
            where: {
                salaryStructureId_rubriqueId: {
                    salaryStructureId: structureId,
                    rubriqueId,
                },
            },
        });
    }
}
