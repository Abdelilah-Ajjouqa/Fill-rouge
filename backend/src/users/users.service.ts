import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, role, gymId, ...rest } = createUserDto;

    if (role === UserRole.ADMIN) {
      if (!gymId) {
        throw new BadRequestException('Admin must be assigned to a gym');
      }

      const existingAdmin = await this.userModel
        .findOne({ role: UserRole.ADMIN, gymId })
        .exec();

      if (existingAdmin) {
        throw new ConflictException('This gym already has an admin');
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = new this.userModel({
      ...rest,
      role,
      gymId,
      passwordHash,
    });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findAll(gymId?: string): Promise<User[]> {
    const filter = gymId ? { gymId } : {};
    return this.userModel.find(filter).select('-passwordHash').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { password, role, gymId, ...rest } = updateUserDto;

    const existingUser = await this.userModel.findById(id).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const nextRole = role ?? existingUser.role;
    const nextGymId = gymId ?? existingUser.gymId;

    if (nextRole === UserRole.ADMIN) {
      if (!nextGymId) {
        throw new BadRequestException('Admin must be assigned to a gym');
      }

      const existingAdmin = await this.userModel
        .findOne({
          role: UserRole.ADMIN,
          gymId: nextGymId,
          _id: { $ne: id },
        })
        .exec();

      if (existingAdmin) {
        throw new ConflictException('This gym already has an admin');
      }
    }

    const updateData: any = { ...rest };

    if (role !== undefined) {
      updateData.role = role;
    }

    if (gymId !== undefined) {
      updateData.gymId = gymId;
    }

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

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return deletedUser;
  }
}
