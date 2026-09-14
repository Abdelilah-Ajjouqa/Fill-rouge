import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Record attendance check-in for a member' })
  checkIn(@Request() req: any, @Body() checkInDto: CheckInDto) {
    return this.attendanceService.checkIn(
      checkInDto,
      req.user.gymId,
      req.user.userId,
    );
  }

  @Get('activity/:activityId/today')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({
    summary: 'Get attendance roster for an activity today or specific date',
  })
  getTodayAttendance(
    @Request() req: any,
    @Param('activityId') activityId: string,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.getTodayAttendance(
      activityId,
      req.user.gymId,
      date,
    );
  }

  @Get('member/:memberId')
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get attendance history for a member' })
  getMemberAttendance(
    @Request() req: any,
    @Param('memberId') memberId: string,
  ) {
    if (
      req.user.role === UserRole.MEMBER &&
      req.user.userId !== memberId
    ) {
      throw new ForbiddenException(
        'You can only view your own attendance history',
      );
    }
    return this.attendanceService.getMemberAttendance(
      memberId,
      req.user.gymId,
    );
  }
}

