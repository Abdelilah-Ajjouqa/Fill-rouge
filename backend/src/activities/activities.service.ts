import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Gym, GymDocument } from '../gyms/schemas/gym.schema';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Gym.name) private gymModel: Model<GymDocument>,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    gymId: string,
  ): Promise<Activity> {
    const gym = await this.gymModel.findById(gymId).exec();
    if (!gym) {
      throw new NotFoundException(`Gym with ID "${gymId}" not found`);
    }

    const hall = gym.halls?.find(
      (entry) => entry._id?.toString() === createActivityDto.hallId,
    );
    if (!hall) {
      throw new NotFoundException('Hall not found in this gym');
    }

    const createdActivity = new this.activityModel({
      ...createActivityDto,
      gymId,
    });
    return createdActivity.save();
  }

  async findAll(gymId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ gymId })
      .populate('coach', 'firstName lastName email')
      .exec();
  }

  async findByCoach(coachId: string, gymId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ coach: coachId, gymId })
      .populate('coach', 'firstName lastName email')
      .exec();
  }

  async findOne(id: string, gymId: string): Promise<Activity> {
    const activity = await this.activityModel
      .findOne({ _id: id, gymId })
      .populate('coach', 'firstName lastName email')
      .exec();
    if (!activity) {
      throw new NotFoundException(
        `Activity with ID "${id}" not found in your gym`,
      );
    }
    return activity;
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    gymId: string,
  ): Promise<Activity> {
    if (updateActivityDto.hallId) {
      const gym = await this.gymModel.findById(gymId).exec();
      if (!gym) {
        throw new NotFoundException(`Gym with ID "${gymId}" not found`);
      }

      const hall = gym.halls?.find(
        (entry) => entry._id?.toString() === updateActivityDto.hallId,
      );
      if (!hall) {
        throw new NotFoundException('Hall not found in this gym');
      }
    }

    const updatedActivity = await this.activityModel
      .findOneAndUpdate({ _id: id, gymId }, updateActivityDto, { new: true })
      .populate('coach', 'firstName lastName email')
      .exec();
    if (!updatedActivity) {
      throw new NotFoundException(
        `Activity with ID "${id}" not found in your gym`,
      );
    }
    return updatedActivity;
  }

  async remove(id: string, gymId: string): Promise<Activity> {
    const deletedActivity = await this.activityModel
      .findOneAndDelete({ _id: id, gymId })
      .exec();
    if (!deletedActivity) {
      throw new NotFoundException(
        `Activity with ID "${id}" not found in your gym`,
      );
    }
    return deletedActivity;
  }
}
