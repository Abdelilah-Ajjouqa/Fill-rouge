import { IsOptional, IsEnum } from 'class-validator';
import { SubscriptionStatus } from '../schemas/subscription.schema';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ example: SubscriptionStatus.ACTIVE, enum: SubscriptionStatus, description: 'Updated status of the subscription' })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;
}
