import { IsOptional, IsEnum } from 'class-validator';
import { SubscriptionStatus } from '../schemas/subscription.schema';

export class UpdateSubscriptionDto {
    @IsEnum(SubscriptionStatus)
    @IsOptional()
    status?: SubscriptionStatus;
}
