import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../schemas/attendance.schema';

export class CheckInDto {
  @ApiProperty({
    example: '64d21b4667d0d8992e610c11',
    description: 'Activity ID',
  })
  @IsMongoId()
  @IsNotEmpty()
  activityId: string;

  @ApiProperty({
    example: '64d21b4667d0d8992e610c22',
    description: 'Member ID',
  })
  @IsMongoId()
  @IsNotEmpty()
  memberId: string;

  @ApiPropertyOptional({
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({
    example: '2026-09-14',
    description: 'Date of session (defaults to today)',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}

