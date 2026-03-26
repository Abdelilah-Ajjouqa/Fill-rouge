import {
  IsNotEmpty,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsMongoId()
  @IsNotEmpty()
  subscription: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @IsDateString()
  @IsOptional()
  paidAt?: string;
}
