import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum BonusCalculationMode {
    FIXE = 'FIXE',
    POURCENTAGE = 'POURCENTAGE',
}

export class CreatePayrollBonusDto {
    @IsString()
    name: string;

    @IsEnum(BonusCalculationMode)
    calculationMode: BonusCalculationMode;

    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsNumber()
    @IsOptional()
    percentage?: number;

    @IsString()
    @IsOptional()
    description?: string;
}
