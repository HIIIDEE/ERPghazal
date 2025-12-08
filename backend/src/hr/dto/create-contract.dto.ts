import { IsEnum, IsNumber, IsDateString, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ContractType, ContractStatus } from '@prisma/client';

export class CreateContractDto {
    @IsEnum(ContractType)
    type: ContractType;

    @IsEnum(ContractStatus)
    @IsOptional()
    status?: ContractStatus;

    @IsDateString()
    startDate: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsOptional()
    @IsNumber()
    wage?: number;

    @IsOptional()
    @IsString()
    trialPeriodEndDate?: string;

    @IsOptional()
    @IsString()
    workingSchedule?: string;

    @IsOptional()
    @IsString()
    scheduledPay?: string;

    @IsNotEmpty()
    @IsString()
    employeeId: string;
}
