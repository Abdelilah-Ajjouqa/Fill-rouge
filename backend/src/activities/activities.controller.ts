import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@ApiTags('Activities')
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new activity' })
  create(@Request() req: any, @Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.create(createActivityDto, req.user.gymId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Retrieve all activities (filtered by role and gym)' })
  findAll(@Request() req: any, @Query('gymId') gymId?: string) {
    if (req.user.role === UserRole.COACH) {
      // Coach sees only their assigned activities in this gym
      return this.activitiesService.findByCoach(
        req.user.userId,
        req.user.gymId,
      );
    }
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.activitiesService.findAll(gymId);
    }
    // Admin sees all activities for their gym
    return this.activitiesService.findAll(req.user.gymId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Retrieve a specific activity by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.activitiesService.findOne(id, req.user.gymId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a specific activity by ID' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, updateActivityDto, req.user.gymId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a specific activity by ID' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.activitiesService.remove(id, req.user.gymId);
  }
}
