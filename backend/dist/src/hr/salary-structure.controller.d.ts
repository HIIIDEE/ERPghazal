import { SalaryStructureService } from './salary-structure.service';
export declare class SalaryStructureController {
    private readonly salaryStructureService;
    constructor(salaryStructureService: SalaryStructureService);
    create(createDto: {
        name: string;
        description?: string;
    }): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<any>;
    remove(id: string): Promise<any>;
    addRubrique(id: string, body: {
        rubriqueId: number;
        ordre: number;
    }): Promise<any>;
    removeRubrique(id: string, rubriqueId: number): Promise<any>;
}
