import { PrismaService } from '../prisma/prisma.service';
import { Rubrique, Prisma } from '@prisma/client';
export declare class RubriqueService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.RubriqueCreateInput): Promise<Rubrique>;
    findAll(): Promise<Rubrique[]>;
    findOne(id: number): Promise<Rubrique | null>;
    update(id: number, data: Prisma.RubriqueUpdateInput): Promise<Rubrique>;
    remove(id: number): Promise<Rubrique>;
}
