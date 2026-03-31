import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Create a new payment' })
  create(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto, req.user.gymId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Retrieve all payments (filtered by role and gym)' })
  findAll(@Request() req: any, @Query('gymId') gymId?: string) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.paymentsService.findAll(gymId);
    }
    return this.paymentsService.findAll(req.user.gymId);
  }

  @Get('unpaid')
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Retrieve all unpaid payments (filtered by role and gym)' })
  findUnpaid(@Request() req: any, @Query('gymId') gymId?: string) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.paymentsService.findUnpaid(gymId);
    }
    return this.paymentsService.findUnpaid(req.user.gymId);
  }

  @Get('me')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Retrieve payments for the current logged-in member' })
  findMyPayments(@Request() req: any) {
    return this.paymentsService.findByMember(req.user.userId, req.user.gymId);
  }
}
