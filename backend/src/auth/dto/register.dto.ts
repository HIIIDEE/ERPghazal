import { IsEmail, IsString, IsOptional, IsArray } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;
}
