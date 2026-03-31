import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Create a new subscription' })
  create(
    @Request() req: any,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(
      createSubscriptionDto,
      req.user.gymId,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Retrieve all subscriptions (filtered by role and gym)' })
  findAll(@Request() req: any, @Query('gymId') gymId?: string) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.subscriptionsService.findAll(gymId);
    }
    return this.subscriptionsService.findAll(req.user.gymId);
  }

  @Get('activity/:activityId')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Retrieve subscriptions by activity ID' })
  findByActivity(@Request() req: any, @Param('activityId') activityId: string) {
    return this.subscriptionsService.findByActivity(activityId, req.user.gymId);
  }

  @Get('member/:memberId')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Retrieve subscriptions by member ID' })
  findByMember(@Request() req: any, @Param('memberId') memberId: string) {
    return this.subscriptionsService.findByMember(memberId, req.user.gymId);
  }

  @Get('me')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Retrieve subscriptions for the current logged-in member' })
  findMySubscriptions(@Request() req: any) {
    return this.subscriptionsService.findByMember(
      req.user.userId,
      req.user.gymId,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Retrieve a specific subscription by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.subscriptionsService.findOne(id, req.user.gymId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a specific subscription by ID' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(
      id,
      updateSubscriptionDto,
      req.user.gymId,
    );
  }
}
