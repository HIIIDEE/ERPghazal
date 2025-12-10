import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class PayrollConfigService {
    private prisma;
    constructor(prisma: PrismaService);
    getParameter(code: string, date?: Date): Promise<number>;
    getAllParameters(date?: Date): Promise<Record<string, number>>;
    upsertParameter(data: {
        code: string;
        nom: string;
        valeur: number;
        description?: string;
        startDate: Date;
        endDate?: Date;
    }): Promise<{
        id: string;
        code: string;
        nom: string;
        valeur: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        description: string | null;
    }>;
    calculateIRG(taxableSalary: number, date?: Date): Promise<number>;
    private calculateIRGFallback;
    initializeDefaultTaxBrackets(startDate?: Date): Promise<void>;
    initializeDefaultParameters(startDate?: Date): Promise<void>;
    private decimalToNumber;
    private roundToTwo;
}
