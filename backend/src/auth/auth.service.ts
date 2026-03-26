import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MembersService } from '../members/members.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private membersService: MembersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // First, try to find in Users collection (Super Admin, Admin, Coach)
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user.toObject();
      return { ...result, isMember: false };
    }

    // If not found, try the Members collection
    const member = await this.membersService.findByEmail(email);
    if (member && (await bcrypt.compare(pass, member.passwordHash))) {
      const { passwordHash, ...result } = member.toObject();
      return { ...result, isMember: true };
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user._id,
      role: user.isMember ? 'MEMBER' : user.role,
      gymId: user.gymId || null,
    };

    // Remove the helper flag before sending to client
    const { isMember, ...userData } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: { ...userData, role: payload.role },
    };
  }

  async register(registrationData: CreateUserDto) {
    return this.usersService.create(registrationData);
  }

  async getProfile(userId: string, role: string) {
    if (role === 'MEMBER') {
      return this.membersService.findById(userId);
    }
    return this.usersService.findOne(userId);
  }
}
