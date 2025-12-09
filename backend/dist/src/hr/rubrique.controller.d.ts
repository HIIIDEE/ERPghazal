import { RubriqueService } from './rubrique.service';
import { Rubrique, Prisma } from '@prisma/client';
export declare class RubriqueController {
    private readonly rubriqueService;
    constructor(rubriqueService: RubriqueService);
    create(data: Prisma.RubriqueCreateInput): Promise<Rubrique>;
    findAll(): Promise<Rubrique[]>;
    findOne(id: number): Promise<Rubrique | null>;
    update(id: number, data: Prisma.RubriqueUpdateInput): Promise<Rubrique>;
    remove(id: number): Promise<Rubrique>;
}
