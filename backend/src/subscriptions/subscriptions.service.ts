import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
} from './schemas/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  Activity,
  ActivityDocument,
} from '../activities/schemas/activity.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    gymId: string,
  ): Promise<Subscription> {
    // Verify the activity exists and belongs to this gym
    const activity = await this.activityModel
      .findOne({
        _id: createSubscriptionDto.activity,
        gymId: new Types.ObjectId(gymId),
      })
      .exec();

    if (!activity) {
      throw new NotFoundException('Activity not found in this gym');
    }

    // Check capacity: count active subscriptions for this activity
    const activeCount = await this.subscriptionModel
      .countDocuments({
        activity: new Types.ObjectId(createSubscriptionDto.activity),
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();

    if (activeCount >= activity.maxCapacity) {
      throw new BadRequestException(
        `Activity "${activity.name}" is full (${activeCount}/${activity.maxCapacity}). No more members can be enrolled.`,
      );
    }

    // Check if this member already has an active subscription for this activity
    const existingActive = await this.subscriptionModel
      .findOne({
        member: new Types.ObjectId(createSubscriptionDto.member),
        activity: new Types.ObjectId(createSubscriptionDto.activity),
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();

    if (existingActive) {
      throw new BadRequestException(
        'This member already has an active subscription for this activity',
      );
    }

    // Calculate endDate as startDate + 1 month if not provided
    const startDate = new Date(createSubscriptionDto.startDate);
    let endDate: Date;
    if (createSubscriptionDto.endDate) {
      endDate = new Date(createSubscriptionDto.endDate);
    } else {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = new this.subscriptionModel({
      gymId: new Types.ObjectId(gymId),
      member: new Types.ObjectId(createSubscriptionDto.member),
      activity: new Types.ObjectId(createSubscriptionDto.activity),
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
    });

    return subscription.save();
  }

  async findAll(gymId: string): Promise<Subscription[]> {
    return this.subscriptionModel
      .find({ gymId: new Types.ObjectId(gymId) })
      .populate('member', 'firstName lastName email')
      .populate('activity', 'name monthlyPrice')
      .exec();
  }

  async findByActivity(
    activityId: string,
    gymId: string,
  ): Promise<Subscription[]> {
    return this.subscriptionModel
      .find({
        activity: new Types.ObjectId(activityId),
        gymId: new Types.ObjectId(gymId),
      })
      .populate('member', 'firstName lastName email phone')
      .populate('activity', 'name monthlyPrice')
      .exec();
  }

  async findByMember(memberId: string, gymId: string): Promise<Subscription[]> {
    return this.subscriptionModel
      .find({
        member: new Types.ObjectId(memberId),
        gymId: new Types.ObjectId(gymId),
      })
      .populate('activity', 'name monthlyPrice schedule')
      .exec();
  }

  async findOne(id: string, gymId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({ _id: id, gymId: new Types.ObjectId(gymId) })
      .populate('member', 'firstName lastName email')
      .populate('activity', 'name monthlyPrice')
      .exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async update(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
    gymId: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOneAndUpdate(
        { _id: id, gymId: new Types.ObjectId(gymId) },
        updateSubscriptionDto,
        { new: true },
      )
      .populate('member', 'firstName lastName email')
      .populate('activity', 'name monthlyPrice')
      .exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }
}
