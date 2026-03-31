import {
  IsArray,
  ArrayMinSize,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ScheduleSlotDto {
  @ApiProperty({ example: 'Monday', description: 'Day of the week' })
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '11:00', description: 'End time in HH:mm format' })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class CreateActivityDto {
  @ApiProperty({ example: 'Yoga Class', description: 'Name of the activity' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '64d21b4667d0d8992e610d11', description: 'Hall ID where the activity takes place' })
  @IsMongoId()
  @IsNotEmpty()
  hallId: string;

  @ApiProperty({ example: '64d21b4667d0d8992e610c11', description: 'Coach ID assigned to this activity' })
  @IsMongoId()
  @IsNotEmpty()
  coach: string;

  @ApiProperty({ example: 50, description: 'Monthly price for the activity' })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({ example: 20, description: 'Maximum capacity of members for the activity' })
  @IsNumber()
  @Min(1)
  maxCapacity: number;

  @ApiProperty({ type: [ScheduleSlotDto], description: 'Schedule slots for the activity' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  schedule: ScheduleSlotDto[];
}
