import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleSlotDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  hallId: string;

  @IsMongoId()
  @IsNotEmpty()
  coach: string;

  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @IsNumber()
  @Min(1)
  maxCapacity: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  schedule?: ScheduleSlotDto[];
}
