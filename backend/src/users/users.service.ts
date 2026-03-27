import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ActingUser } from 'types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  private toIdString(value: unknown): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && value !== null && '_id' in value) {
      const idValue = (value as { _id?: unknown })._id;
      return idValue ? String(idValue) : null;
    }

    return String(value);
  }

  private async ensureGymHasNoOtherAdmin(
    gymId: string,
    excludedUserId?: string,
  ): Promise<void> {
    const filter: Record<string, unknown> = {
      gymId,
      role: UserRole.ADMIN,
    };

    if (excludedUserId) {
      filter._id = { $ne: excludedUserId };
    }

    const adminsCount = await this.userModel.countDocuments(filter).exec();

    if (adminsCount > 0) {
      throw new BadRequestException('This gym already has an ADMIN');
    }
  }

  async create(createUserDto: CreateUserDto, actingUser?: ActingUser): Promise<User> {
    const { password, ...rest } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 10);

    const payload: Omit<CreateUserDto, 'password'> = { ...rest };

    if (actingUser?.role === UserRole.ADMIN) {
      const actorGymId = this.toIdString(actingUser.gymId);

      if (!actorGymId) {
        throw new ForbiddenException(
          'ADMIN must belong to a gym to create staff users',
        );
      }

      if (payload.role === UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('ADMIN cannot create SUPER_ADMIN users');
      }

      if (payload.gymId && payload.gymId !== actorGymId) {
        throw new ForbiddenException(
          'ADMIN can only create users inside their own gym',
        );
      }

      payload.gymId = actorGymId;
    }

    if (payload.role === UserRole.ADMIN) {
      const targetGymId = this.toIdString(payload.gymId);

      if (!targetGymId) {
        throw new BadRequestException('ADMIN user must belong to a gym');
      }

      await this.ensureGymHasNoOtherAdmin(targetGymId);
    }

    const createdUser = new this.userModel({
      ...payload,
      passwordHash,
    });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOne(id: string, actingUser?: ActingUser): Promise<User | null> {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (actingUser?.role === UserRole.ADMIN) {
      const actorGymId = this.toIdString(actingUser.gymId);
      const targetGymId = this.toIdString(user.gymId);

      if (!actorGymId || actorGymId !== targetGymId) {
        throw new ForbiddenException(
          'ADMIN can only access users in their own gym',
        );
      }
    }

    return user;
  }

  async findAll(gymId?: string): Promise<User[]> {
    const filter = gymId ? { gymId } : {};
    return this.userModel.find(filter).select('-passwordHash').exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    actingUser?: ActingUser,
  ): Promise<User> {
    const { password, ...rest } = updateUserDto;

    if (rest.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Role elevation to SUPER_ADMIN is not allowed');
    }

    const existingUser = await this.userModel.findById(id).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (actingUser?.role === UserRole.ADMIN) {
      const actorGymId = this.toIdString(actingUser.gymId);
      const targetGymId = this.toIdString(existingUser.gymId);

      if (!actorGymId || actorGymId !== targetGymId) {
        throw new ForbiddenException(
          'ADMIN can only manage users in their own gym',
        );
      }

      if (rest.gymId && rest.gymId !== actorGymId) {
        throw new ForbiddenException(
          'ADMIN cannot move users to another gym',
        );
      }
    }

    if (actingUser?.userId === id && rest.isActive === false) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const nextRole = rest.role ?? existingUser.role;
    const nextGymId = this.toIdString(rest.gymId ?? existingUser.gymId);

    if (nextRole === UserRole.ADMIN) {
      if (!nextGymId) {
        throw new BadRequestException('ADMIN user must belong to a gym');
      }

      await this.ensureGymHasNoOtherAdmin(nextGymId, id);
    }

    const updateData: any = { ...rest };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-passwordHash')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return updatedUser;
  }

  async remove(id: string, actingUser?: ActingUser): Promise<User> {
    const existingUser = await this.userModel.findById(id).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (actingUser?.role === UserRole.ADMIN) {
      const actorGymId = this.toIdString(actingUser.gymId);
      const targetGymId = this.toIdString(existingUser.gymId);

      if (!actorGymId || actorGymId !== targetGymId) {
        throw new ForbiddenException(
          'ADMIN can only delete users in their own gym',
        );
      }
    }

    if (actingUser?.userId === id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const deletedUser = await this.userModel
      .findByIdAndDelete(id)
      .select('-passwordHash')
      .exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return deletedUser;
  }
}
