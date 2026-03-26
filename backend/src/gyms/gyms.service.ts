import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gym, GymDocument } from './schemas/gym.schema';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';

@Injectable()
export class GymsService {
  constructor(@InjectModel(Gym.name) private gymModel: Model<GymDocument>) {}

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
    if (!gym) {
      throw new NotFoundException(`Gym with ID "${id}" not found`);
    }
    return gym;
  }

  async update(id: string, updateGymDto: UpdateGymDto): Promise<Gym> {
    const updatedGym = await this.gymModel
      .findByIdAndUpdate(id, updateGymDto, { new: true })
      .exec();
    if (!updatedGym) {
      throw new NotFoundException(`Gym with ID "${id}" not found`);
    }
    return updatedGym;
  }

  async remove(id: string): Promise<Gym> {
    const deletedGym = await this.gymModel.findByIdAndDelete(id).exec();
    if (!deletedGym) {
      throw new NotFoundException(`Gym with ID "${id}" not found`);
    }
    return deletedGym;
  }
}
