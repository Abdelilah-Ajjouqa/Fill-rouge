import {
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateSubscriptionDto {
  @IsMongoId()
  @IsNotEmpty()
  member: string;

  @IsMongoId()
  @IsNotEmpty()
  activity: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
