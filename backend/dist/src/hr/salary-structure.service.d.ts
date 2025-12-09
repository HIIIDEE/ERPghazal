import { PrismaService } from '../prisma/prisma.service';
export declare class SalaryStructureService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        description?: string;
    }): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<any>;
    remove(id: string): Promise<any>;
    addRubriqueToStructure(structureId: string, rubriqueId: number, ordre: number): Promise<any>;
    removeRubriqueFromStructure(structureId: string, rubriqueId: number): Promise<any>;
}
