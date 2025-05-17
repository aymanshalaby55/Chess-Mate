import { IsEmail, IsOptional, IsString, IsUUID } from "class-validator";

export class UserDto {
    @IsUUID()
    id: string;

    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    googleId?: string;

    @IsString()
    @IsOptional()
    picture?: string;
}

export class GoogleUserDto {
    @IsString()
    id: string;

    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    picture?: string;
}
