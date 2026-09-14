import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
import { Gym, GymDocument } from '../gyms/schemas/gym.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Gym.name) private gymModel: Model<GymDocument>,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    gymId: string,
  ): Promise<Subscription> {
    const activityId = new Types.ObjectId(createSubscriptionDto.activity);
    const memberId = new Types.ObjectId(createSubscriptionDto.member);
    const gymObjId = new Types.ObjectId(gymId);

    const activity = await this.activityModel
      .findOne({ _id: activityId, gymId: gymObjId })
      .exec();
    if (!activity)
      throw new NotFoundException('Activity not found in this gym');
    if (!activity.hallId)
      throw new BadRequestException('Activity has no hall assigned');

    const gym = await this.gymModel.findById(gymId).exec();
    if (!gym) throw new NotFoundException('Gym not found');

    const hall = gym.halls?.find(
      (entry) => entry._id?.toString() === activity.hallId?.toString(),
    );
    if (!hall)
      throw new BadRequestException('Activity hall not found in this gym');

    const effectiveCapacity = Math.min(activity.maxCapacity, hall.capacity);
    const activeCount = await this.subscriptionModel
      .countDocuments({
        activity: activityId,
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();

    if (activeCount >= effectiveCapacity) {
      throw new BadRequestException(
        `Activity "${activity.name}" is full (${activeCount}/${effectiveCapacity}). No more members can be enrolled.`,
      );
    }

    const existingActive = await this.subscriptionModel
      .findOne({
        member: memberId,
        activity: activityId,
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();
    if (existingActive)
      throw new BadRequestException(
        'This member already has an active subscription for this activity',
      );

    const startDate = new Date(createSubscriptionDto.startDate);
    const endDate = createSubscriptionDto.endDate
      ? new Date(createSubscriptionDto.endDate)
      : new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

    const subscription = new this.subscriptionModel({
      gymId: gymObjId,
      member: memberId,
      activity: activityId,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
    });

    return subscription.save();
  }

  async findAll(gymId?: string): Promise<Subscription[]> {
    const filter = gymId ? { gymId: new Types.ObjectId(gymId) } : {};
    return this.subscriptionModel
      .find(filter)
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
      .populate({
        path: 'activity',
        select: 'name monthlyPrice schedule coach',
        populate: { path: 'coach', select: 'firstName lastName email' },
      })
      .exec();
  }

  async findOne(id: string, gymId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({ _id: id, gymId: new Types.ObjectId(gymId) })
      .populate('member', 'firstName lastName email')
      .populate('activity', 'name monthlyPrice')
      .exec();

    if (!subscription) throw new NotFoundException('Subscription not found');
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

    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredSubscriptions() {
    const now = new Date();
    const result = await this.subscriptionModel.updateMany(
      {
        status: SubscriptionStatus.ACTIVE,
        endDate: { $lt: now },
      },
      {
        $set: { status: SubscriptionStatus.EXPIRED },
      },
    );
    if (result.modifiedCount > 0) {
      console.log(
        `[SubscriptionCron] Expired ${result.modifiedCount} subscription(s).`,
      );
    }
  }

  async renew(id: string, gymId?: string): Promise<Subscription> {
    const query: any = { _id: new Types.ObjectId(id) };
    if (gymId) {
      query.gymId = new Types.ObjectId(gymId);
    }

    const subscription = await this.subscriptionModel.findOne(query).exec();
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const now = new Date();
    const currentEnd = subscription.endDate
      ? new Date(subscription.endDate)
      : now;
    const baseDate = currentEnd > now ? currentEnd : now;
    const newEndDate = new Date(baseDate);
    newEndDate.setMonth(newEndDate.getMonth() + 1);

    subscription.endDate = newEndDate;
    subscription.status = SubscriptionStatus.ACTIVE;
    await subscription.save();

    const targetGymId = (subscription.gymId as any)?.toString() || gymId || '';
    return this.findOne(id, targetGymId);
  }
}
