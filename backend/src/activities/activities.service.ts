import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
    constructor(
        @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    ) {}

    async create(createActivityDto: CreateActivityDto): Promise<Activity> {
        const createdActivity = new this.activityModel(createActivityDto);
        return createdActivity.save();
    }

    async findAll(): Promise<Activity[]> {
        return this.activityModel.find().populate('coach', 'firstName lastName email').exec();
    }

    async findByCoach(coachId: string): Promise<Activity[]> {
        return this.activityModel
            .find({ coach: coachId })
            .populate('coach', 'firstName lastName email')
            .exec();
    }

    async findOne(id: string): Promise<Activity> {
        const activity = await this.activityModel
            .findById(id)
            .populate('coach', 'firstName lastName email')
            .exec();
        if (!activity) {
            throw new NotFoundException(`Activity with ID "${id}" not found`);
        }
        return activity;
    }

    async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
        const updatedActivity = await this.activityModel
            .findByIdAndUpdate(id, updateActivityDto, { new: true })
            .populate('coach', 'firstName lastName email')
            .exec();
        if (!updatedActivity) {
            throw new NotFoundException(`Activity with ID "${id}" not found`);
        }
        return updatedActivity;
    }

    async remove(id: string): Promise<Activity> {
        const deletedActivity = await this.activityModel.findByIdAndDelete(id).exec();
        if (!deletedActivity) {
            throw new NotFoundException(`Activity with ID "${id}" not found`);
        }
        return deletedActivity;
    }
}
