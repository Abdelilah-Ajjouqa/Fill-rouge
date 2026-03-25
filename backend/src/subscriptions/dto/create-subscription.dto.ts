import { IsNotEmpty, IsMongoId, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { SubscriptionStatus } from '../schemas/subscription.schema';

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
