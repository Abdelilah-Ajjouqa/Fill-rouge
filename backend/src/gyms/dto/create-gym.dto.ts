import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HallDto {
  @ApiPropertyOptional({ example: '64d21b4667d0d8992e610d11', description: 'Hall ID (auto-generated if empty)' })
  @IsOptional()
  @IsMongoId()
  _id?: string;

  @ApiProperty({ example: 'Main Studio', description: 'Name of the hall' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Cardio', description: 'Type of activities in the hall' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 50, description: 'Maximum capacity of the hall' })
  @IsNumber()
  @Min(1)
  capacity: number;
}

export class CreateGymDto {
  @ApiProperty({ example: 'FitZone', description: 'Gym name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Fitness Street', description: 'Gym address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '+1234567890', description: 'Gym contact phone' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: '/uploads/logos/logo.png', description: 'Path to the gym logo (uploaded)' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the gym is active' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({ type: [HallDto], description: 'Halls configured in the gym' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HallDto)
  @Transform(
    ({ value }) => {
      if (value === undefined || value === null) {
        return value;
      }

      let parsed = value;
      if (typeof value === 'string') {
        if (!value.trim()) {
          return [];
        }
        try {
          parsed = JSON.parse(value);
        } catch {
          return value;
        }
      }

      if (!Array.isArray(parsed)) {
        return parsed;
      }

      return plainToInstance(HallDto, parsed);
    },
    { toClassOnly: true },
  )
  halls?: HallDto[];
}
