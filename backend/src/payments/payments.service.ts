import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  Subscription,
  SubscriptionDocument,
} from '../subscriptions/schemas/subscription.schema';
import {
  Activity,
  ActivityDocument,
} from '../activities/schemas/activity.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, gymId: string): Promise<Payment> {
    const subscriptionId = new Types.ObjectId(createPaymentDto.subscription);
    const gymObjectId = new Types.ObjectId(gymId);

    const subscription = await this.subscriptionModel
      .findOne({ _id: subscriptionId, gymId: gymObjectId })
      .exec();
    
    if (!subscription) {
      throw new NotFoundException('Subscription not found in this gym');
    }

    const activity = await this.activityModel.findById(subscription.activity).exec();
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const existingPayment = await this.paymentModel
      .findOne({ subscription: subscriptionId })
      .exec();

    if (existingPayment) {
      throw new BadRequestException('This subscription is already paid');
    }

    const amountDue = activity.monthlyPrice;
    if (createPaymentDto.amount !== amountDue) {
      throw new BadRequestException(
        `Full payment required. Amount must be exactly ${amountDue} DH`,
      );
    }

    const payment = new this.paymentModel({
      gymId: gymObjectId,
      subscription: subscriptionId,
      amount: amountDue,
      amountDue,
      paidAt: createPaymentDto.paidAt ? new Date(createPaymentDto.paidAt) : new Date(),
    });

    return payment.save();
  }

  async findByMember(memberId: string, gymId?: string): Promise<Payment[]> {
    const filter: any = { member: new Types.ObjectId(memberId) };
    if (gymId) filter.gymId = new Types.ObjectId(gymId);

    const subscriptions = await this.subscriptionModel.find(filter).select('_id').exec();
    if (!subscriptions.length) return [];

    const subscriptionIds = subscriptions.map((sub) => sub._id);

    return this.paymentModel
      .find({ subscription: { $in: subscriptionIds } })
      .populate({
        path: 'subscription',
        populate: [
          { path: 'member', select: 'firstName lastName email' },
          {
            path: 'activity',
            select: 'name monthlyPrice schedule coach',
            populate: { path: 'coach', select: 'firstName lastName email' },
          },
        ],
      })
      .sort({ paidAt: -1 })
      .exec();
  }

  async findAll(gymId?: string): Promise<Payment[]> {
    const filter = gymId ? { gymId: new Types.ObjectId(gymId) } : {};
    return this.paymentModel
      .find(filter)
      .populate({
        path: 'subscription',
        populate: [
          { path: 'member', select: 'firstName lastName email' },
          { path: 'activity', select: 'name monthlyPrice' },
        ],
      })
      .sort({ paidAt: -1 })
      .exec();
  }

  async findUnpaid(gymId?: string) {
    const filter: any = { status: 'active' };
    if (gymId) filter.gymId = new Types.ObjectId(gymId);

    // 1. Fetch all active subscriptions across the system/gym natively
    const subscriptions = await this.subscriptionModel
      .find(filter)
      .populate('member', 'firstName lastName email phone')
      .populate('activity', 'name monthlyPrice')
      .exec();

    if (!subscriptions.length) return [];

    // 2. Batch fetch ALL payments tied to these active subscriptions
    const activeSubIds = subscriptions.map((s) => s._id);
    const existingPayments = await this.paymentModel
      .find({ subscription: { $in: activeSubIds } })
      .select('subscription')
      .exec();

    const paidSubIds = new Set(existingPayments.map((p) => String(p.subscription)));

    // 3. Filter natively in memory (Eliminates the N+1 database queries)
    return subscriptions
      .filter((sub) => !paidSubIds.has(String(sub._id)))
      .map((sub) => ({
        subscription: sub,
        amountDue: (sub.activity as any).monthlyPrice,
      }));
  }
}
