import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Gym, GymDocument } from '../gyms/schemas/gym.schema';

type ScheduleSlotLike = {
  day: string;
  startTime: string;
  endTime: string;
};

const getReferenceId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  
  if (!value || typeof value !== 'object') return null;

  const maybeRecord = value as any;
  if (['string', 'number', 'bigint'].includes(typeof maybeRecord._id)) return String(maybeRecord._id);
  if (['string', 'number', 'bigint'].includes(typeof maybeRecord.id)) return String(maybeRecord.id);

  return null;
};

const parseTimeToMinutes = (time: string): number | null => {
  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return hour * 60 + minute;
};

const slotsOverlap = (left: ScheduleSlotLike, right: ScheduleSlotLike) => {
  if (left.day !== right.day) return false;

  const leftStart = parseTimeToMinutes(left.startTime);
  const leftEnd = parseTimeToMinutes(left.endTime);
  const rightStart = parseTimeToMinutes(right.startTime);
  const rightEnd = parseTimeToMinutes(right.endTime);

  if (leftStart === null || leftEnd === null || rightStart === null || rightEnd === null) return false;

  return leftStart < rightEnd && rightStart < leftEnd;
};

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Gym.name) private gymModel: Model<GymDocument>,
  ) {}

  private getGymHallOrThrow(gym: Gym, hallId: string) {
    const hall = gym.halls?.find((entry) => entry._id?.toString() === hallId);
    if (!hall) throw new NotFoundException('Hall not found in this gym');
    return hall;
  }

  private validateScheduleSlots(slots: ScheduleSlotLike[]) {
    if (!slots.length) {
      throw new BadRequestException('At least one schedule slot is required.');
    }

    for (const slot of slots) {
      const start = parseTimeToMinutes(slot.startTime);
      const end = parseTimeToMinutes(slot.endTime);

      if (start === null || end === null) {
        throw new BadRequestException('Invalid schedule time format. Use HH:mm.');
      }

      if (start >= end) {
        throw new BadRequestException('Schedule start time must be before end time.');
      }
    }

    const hasInternalOverlap = slots.some((slotA, i) => 
      slots.some((slotB, j) => i !== j && slotsOverlap(slotA, slotB))
    );

    if (hasInternalOverlap) {
      throw new BadRequestException('Activity schedule contains overlapping time slots internally.');
    }
  }

  private ensureHallCapacity(maxCapacity: number, hallCapacity: number) {
    if (maxCapacity > hallCapacity) {
      throw new BadRequestException(`Max capacity cannot exceed selected hall capacity (${hallCapacity}).`);
    }
  }

  private async ensureNoScheduleConflicts(params: {
    gymId: string;
    hallId: string;
    coachId: string;
    schedule: ScheduleSlotLike[];
    excludeActivityId?: string;
  }) {
    const { gymId, hallId, coachId, schedule, excludeActivityId } = params;
    if (!schedule.length) return;

    const existingActivities = await this.activityModel
      .find({
        gymId,
        _id: { $ne: excludeActivityId },
        $or: [{ hallId }, { coach: coachId }],
      })
      .select('name hallId coach schedule')
      .lean()
      .exec();

    for (const existingActivity of existingActivities) {
      const existingSlots = (existingActivity.schedule as ScheduleSlotLike[]) || [];

      const overlappingSlot = schedule.find(incoming => 
        existingSlots.some(existing => slotsOverlap(incoming, existing))
      );

      if (overlappingSlot) {
        if (String(existingActivity.hallId) === hallId) {
          throw new BadRequestException(`Hall is already occupied on ${overlappingSlot.day} during ${overlappingSlot.startTime}-${overlappingSlot.endTime}.`);
        }

        if (getReferenceId(existingActivity.coach) === coachId) {
          throw new BadRequestException(`Coach is already assigned on ${overlappingSlot.day} during ${overlappingSlot.startTime}-${overlappingSlot.endTime}.`);
        }
      }
    }
  }

  async create(createActivityDto: CreateActivityDto, gymId: string): Promise<Activity> {
    const gym = await this.gymModel.findById(gymId).exec();
    if (!gym) throw new NotFoundException(`Gym with ID "${gymId}" not found`);

    const hall = this.getGymHallOrThrow(gym, createActivityDto.hallId);
    this.ensureHallCapacity(createActivityDto.maxCapacity, hall.capacity);

    const incomingSchedule = createActivityDto.schedule ?? [];
    this.validateScheduleSlots(incomingSchedule);
    
    await this.ensureNoScheduleConflicts({
      gymId,
      hallId: createActivityDto.hallId,
      coachId: createActivityDto.coach,
      schedule: incomingSchedule,
    });

    const createdActivity = new this.activityModel({
      ...createActivityDto,
      gymId,
    });
    
    return createdActivity.save();
  }

  async findAll(gymId?: string): Promise<Activity[]> {
    const filter = gymId ? { gymId } : {};
    return this.activityModel
      .find(filter)
      .populate('coach', 'firstName lastName email')
      .populate('gymId', 'name')
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
      throw new NotFoundException(`Activity with ID "${id}" not found in your gym`);
    }
    
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto, gymId: string): Promise<Activity> {
    const existingActivity = await this.activityModel.findOne({ _id: id, gymId }).exec();
    if (!existingActivity) {
      throw new NotFoundException(`Activity with ID "${id}" not found in your gym`);
    }

    const gym = await this.gymModel.findById(gymId).exec();
    if (!gym) throw new NotFoundException(`Gym with ID "${gymId}" not found`);

    const nextHallId = updateActivityDto.hallId || existingActivity.hallId?.toString() || '';
    const nextCoachId = updateActivityDto.coach || getReferenceId(existingActivity.coach) || '';

    if (!nextHallId) throw new NotFoundException('Hall not found in this gym');
    if (!nextCoachId) throw new BadRequestException('Coach is required for this activity.');

    const nextMaxCapacity = updateActivityDto.maxCapacity ?? existingActivity.maxCapacity;
    const nextSchedule = (updateActivityDto.schedule as ScheduleSlotLike[]) 
      ?? (existingActivity.schedule as ScheduleSlotLike[]) 
      ?? [];

    const hall = this.getGymHallOrThrow(gym, nextHallId);

    if (updateActivityDto.maxCapacity !== undefined || updateActivityDto.hallId !== undefined) {
      this.ensureHallCapacity(nextMaxCapacity, hall.capacity);
    }

    this.validateScheduleSlots(nextSchedule);

    if (updateActivityDto.schedule || updateActivityDto.hallId || updateActivityDto.coach) {
      await this.ensureNoScheduleConflicts({
        gymId,
        hallId: nextHallId,
        coachId: nextCoachId,
        schedule: nextSchedule,
        excludeActivityId: id,
      });
    }

    const updatedActivity = await this.activityModel
      .findOneAndUpdate({ _id: id, gymId }, updateActivityDto, { new: true })
      .populate('coach', 'firstName lastName email')
      .exec();

    if (!updatedActivity) throw new NotFoundException(`Activity with ID "${id}" not found in your gym`);

    return updatedActivity;
  }

  async remove(id: string, gymId: string): Promise<Activity> {
    const deletedActivity = await this.activityModel.findOneAndDelete({ _id: id, gymId }).exec();
    if (!deletedActivity) {
      throw new NotFoundException(`Activity with ID "${id}" not found in your gym`);
    }
    return deletedActivity;
  }
}
