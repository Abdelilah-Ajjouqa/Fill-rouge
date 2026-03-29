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

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COACH)
  create(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto, req.user.gymId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.SUPER_ADMIN)
  findAll(@Request() req: any, @Query('gymId') gymId?: string) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.paymentsService.findAll(gymId);
    }
    return this.paymentsService.findAll(req.user.gymId);
  }

  @Get('unpaid')
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.SUPER_ADMIN)
  findUnpaid(@Request() req: any, @Query('gymId') gymId?: string) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.paymentsService.findUnpaid(gymId);
    }
    return this.paymentsService.findUnpaid(req.user.gymId);
  }
}
