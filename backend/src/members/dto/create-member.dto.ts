import {
  IsString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMemberDto {
  @ApiPropertyOptional({ example: '64d21b4667d0d8992e610c11', description: 'Gym ID (optional for Super Admin, infused by Admin)' })
  @IsOptional()
  @IsMongoId()
  gymId?: string;

  @ApiProperty({ example: 'John', description: 'Member first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Member last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'member.john@fitmanager.com', description: 'Member email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'securePassword123!', description: 'Member password (min 6 chars)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Member phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Member date of birth' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '/uploads/photos/photo.png', description: 'Member profile photo path' })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({ example: '/uploads/medical/cert.pdf', description: 'Member medical certificate path' })
  @IsOptional()
  @IsString()
  medicalCertificate?: string;
}
