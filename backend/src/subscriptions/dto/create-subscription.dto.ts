import {
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: '64d21b4667d0d8992e610a11', description: 'Member ID' })
  @IsMongoId()
  @IsNotEmpty()
  member: string;

  @ApiProperty({ example: '64d21b4667d0d8992e610a22', description: 'Activity ID' })
  @IsMongoId()
  @IsNotEmpty()
  activity: string;

  @ApiProperty({ example: '2023-11-01T00:00:00.000Z', description: 'Start date of the subscription' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ example: '2023-12-01T00:00:00.000Z', description: 'End date of the subscription (optional)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
