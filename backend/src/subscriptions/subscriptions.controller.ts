import {
    Controller, Get, Post, Patch,
    Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.COACH)
    create(@Request() req: any, @Body() createSubscriptionDto: CreateSubscriptionDto) {
        return this.subscriptionsService.create(createSubscriptionDto, req.user.gymId);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.COACH)
    findAll(@Request() req: any) {
        return this.subscriptionsService.findAll(req.user.gymId);
    }

    @Get('activity/:activityId')
    @Roles(UserRole.ADMIN, UserRole.COACH)
    findByActivity(@Request() req: any, @Param('activityId') activityId: string) {
        return this.subscriptionsService.findByActivity(activityId, req.user.gymId);
    }

    @Get('member/:memberId')
    @Roles(UserRole.ADMIN, UserRole.COACH)
    findByMember(@Request() req: any, @Param('memberId') memberId: string) {
        return this.subscriptionsService.findByMember(memberId, req.user.gymId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.COACH)
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.subscriptionsService.findOne(id, req.user.gymId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Request() req: any, @Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
        return this.subscriptionsService.update(id, updateSubscriptionDto, req.user.gymId);
    }
}
