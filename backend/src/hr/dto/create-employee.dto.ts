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
}
