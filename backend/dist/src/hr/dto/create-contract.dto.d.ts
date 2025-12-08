import { ContractType, ContractStatus } from '@prisma/client';
export declare class CreateContractDto {
    type: ContractType;
    status?: ContractStatus;
    startDate: string;
    endDate?: string;
    wage?: number;
    trialPeriodEndDate?: string;
    workingSchedule?: string;
    scheduledPay?: string;
    employeeId: string;
}
