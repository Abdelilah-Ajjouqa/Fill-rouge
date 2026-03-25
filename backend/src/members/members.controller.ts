import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COACH)
  create(@Request() req: any, @Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto, req.user.gymId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COACH)
  findAll(@Request() req: any) {
    return this.membersService.findAll(req.user.gymId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.membersService.findOne(id, req.user.gymId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  update(@Request() req: any, @Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(id, updateMemberDto, req.user.gymId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Request() req: any, @Param('id') id: string) {
    // Only Admin can delete members, per the README
    return this.membersService.remove(id, req.user.gymId);
  }
}
