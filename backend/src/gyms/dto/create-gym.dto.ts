import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGymDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsOptional()
    logo?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
