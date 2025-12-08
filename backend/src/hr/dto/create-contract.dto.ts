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

    @IsOptional()
    @IsNumber()
    hourlyWage?: number;

    @IsOptional()
    @IsNumber()
    weeklyHours?: number;

    @IsOptional()
    @IsString()
    classification?: string;

    @IsOptional()
    @IsString()
    coefficient?: string;

    @IsOptional()
    benefits?: any;

    @IsOptional()
    @IsString() // Enum
    cnasScheme?: string;

    @IsOptional()
    @IsString() // Enum
    fiscalScheme?: string;

    @IsOptional()
    @IsString() // Enum
    executiveStatus?: string;

    @IsOptional()
    @IsNumber()
    trialPeriodDuration?: number;
}
