import {
  IsNotEmpty,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: '64d21b4667d0d8992e610b99', description: 'Subscription ID associated with this payment' })
  @IsMongoId()
  @IsNotEmpty()
  subscription: string;

  @ApiProperty({ example: 100, description: 'Amount paid' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: '2023-11-20T10:00:00.000Z', description: 'Date the payment was made' })
  @IsDateString()
  @IsOptional()
  paidAt?: string;
}
