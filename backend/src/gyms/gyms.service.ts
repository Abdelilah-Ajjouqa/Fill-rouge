import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gym, GymDocument } from './schemas/gym.schema';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class GymsService {
  constructor(
    @InjectModel(Gym.name) private gymModel: Model<GymDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createGymDto: CreateGymDto): Promise<Gym> {
    const existing = await this.gymModel.findOne({ name: createGymDto.name }).exec();
    if (existing) {
      throw new ConflictException(`A gym with the name "${createGymDto.name}" already exists`);
    }

    const createdGym = new this.gymModel(createGymDto);
    return createdGym.save();
  }

  async findAll(): Promise<Gym[]> {
    return this.gymModel.find().exec();
  }

  async findOne(id: string): Promise<Gym> {
    const gym = await this.gymModel.findById(id).exec();
    
    if (!gym) throw new NotFoundException(`Gym with ID "${id}" not found`);
    return gym;
  }

  async update(id: string, updateGymDto: UpdateGymDto): Promise<Gym> {
    const updatedGym = await this.gymModel.findByIdAndUpdate(id, updateGymDto, { new: true }).exec();
    
    if (!updatedGym) throw new NotFoundException(`Gym with ID "${id}" not found`);
    return updatedGym;
  }

  async remove(id: string): Promise<Gym> {
    const gym = await this.gymModel.findById(id).exec();
    if (!gym) throw new NotFoundException(`Gym with ID "${id}" not found`);

    // Keep user accounts but detach them from the deleted gym safely
    await this.userModel.updateMany({ gymId: gym._id }, { $set: { gymId: null } }).exec();
    await this.gymModel.findByIdAndDelete(id).exec();
    
    return gym;
  }
}
