import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MembersService } from '../members/members.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private membersService: MembersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash: _ph, ...result } = user.toObject();
      return { ...result, isMember: false };
    }

    const member = await this.membersService.findByEmail(email);

    if (member && await bcrypt.compare(pass, member.passwordHash)) {
      const { passwordHash: _ph, ...result } = member.toObject();
      return { ...result, isMember: true };
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const role = user.isMember ? UserRole.MEMBER : user.role;
    
    const payload = {
      email: user.email,
      sub: user._id,
      role,
      gymId: user.gymId || null,
    };

    const { isMember: _, ...userData } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: { ...userData, role },
    };
  }

  async register(registrationData: CreateUserDto) {
    return this.usersService.create(registrationData);
  }

  async getProfile(userId: string, role: string) {
    if (role === UserRole.MEMBER as string) {
      const member = await this.membersService.findById(userId);
      return { ...member.toObject(), role: UserRole.MEMBER };
    }
    
    return this.usersService.findOne(userId);
  }
}
