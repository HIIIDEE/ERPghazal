import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    workEmail: string;

    @IsString()
    @IsOptional()
    jobTitle?: string;

    @IsString()
    @IsOptional()
    workPhone?: string;

    @IsString()
    @IsOptional()
    workMobile?: string;

    @IsString()
    @IsOptional()
    departmentId?: string;

    @IsString()
    @IsOptional()
    departmentName?: string; // For rapid prototyping if ID not available

    @IsString()
    @IsOptional()
    managerId?: string;

    @IsString()
    @IsOptional()
    coachId?: string;

    @IsDateString()
    hireDate: string;

    // Private Info
    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail()
    @IsOptional()
    privateEmail?: string;

    @IsString()
    @IsOptional()
    positionId?: string;

    @IsString()
    @IsOptional()
    identificationId?: string;

    @IsString()
    @IsOptional()
    badgeId?: string;

    @IsString()
    @IsOptional()
    paymentMethod?: string; // Will cast to enum in service

    @IsOptional()
    children?: number;

    @IsString()
    @IsOptional()
    maritalStatus?: string;

    @IsString()
    @IsOptional()
    placeOfBirth?: string;

    @IsString()
    @IsOptional()
    countryOfBirth?: string;

    @IsString()
    @IsOptional()
    bankAccount?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    nationality?: string;

    @IsString()
    @IsOptional()
    emergencyContact?: string;

    @IsString()
    @IsOptional()
    emergencyPhone?: string;

    @IsDateString()
    @IsOptional()
    birthday?: string;

    @IsString()
    @IsOptional()
    workLocation?: string;

    // CNAS
    @IsString()
    @IsOptional()
    socialSecurityNumber?: string;

    @IsString()
    @IsOptional()
    cnasAgency?: string;

    @IsDateString()
    @IsOptional()
    cnasStartDate?: string;

    @IsOptional()
    isHandicapped?: boolean;

    @IsOptional()
    cnasContribution?: boolean;

    @IsString()
    @IsOptional()
    cnasRateSalary?: string;

    @IsString()
    @IsOptional()
    cnasRatePatron?: string;

    @IsString()
    @IsOptional()
    cnasRateSocial?: string;

    @IsString()
    @IsOptional()
    cnasRateHousing?: string;

    @IsString()
    @IsOptional()
    cnasRateCacobath?: string;

    @IsString()
    @IsOptional()
    cnasRateService?: string;

    @IsString()
    @IsOptional()
    cnasMutual?: string;
}
