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

  async create(
    createPaymentDto: CreatePaymentDto,
    gymId: string,
  ): Promise<Payment> {
    const subscription = await this.subscriptionModel
      .findOne({
        _id: createPaymentDto.subscription,
        gymId: new Types.ObjectId(gymId),
      })
      .exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found in this gym');
    }

    // Get the activity to know the monthly price
    const activity = await this.activityModel
      .findById(subscription.activity)
      .exec();
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    // Check if already paid for this subscription
    const existingPayment = await this.paymentModel
      .findOne({
        subscription: new Types.ObjectId(createPaymentDto.subscription),
      })
      .exec();

    if (existingPayment) {
      throw new BadRequestException('This subscription is already paid');
    }

    // Full payment only — amount must equal the monthly price
    const amountDue = activity.monthlyPrice;

    if (createPaymentDto.amount !== amountDue) {
      throw new BadRequestException(
        `Full payment required. Amount must be exactly ${amountDue} DH`,
      );
    }

    const payment = new this.paymentModel({
      gymId: new Types.ObjectId(gymId),
      subscription: new Types.ObjectId(createPaymentDto.subscription),
      amount: amountDue,
      amountDue,
      paidAt: createPaymentDto.paidAt
        ? new Date(createPaymentDto.paidAt)
        : new Date(),
    });

    return payment.save();
  }

  async findAll(gymId: string): Promise<Payment[]> {
    return this.paymentModel
      .find({ gymId: new Types.ObjectId(gymId) })
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

  async findUnpaid(gymId: string) {
    // Find active subscriptions that have no payment record
    const subscriptions = await this.subscriptionModel
      .find({ gymId: new Types.ObjectId(gymId), status: 'active' })
      .populate('member', 'firstName lastName email phone')
      .populate('activity', 'name monthlyPrice')
      .exec();

    const unpaid: Array<{ subscription: any; amountDue: number }> = [];

    for (const sub of subscriptions) {
      const payment = await this.paymentModel
        .findOne({ subscription: sub._id })
        .exec();

      if (!payment) {
        unpaid.push({
          subscription: sub,
          amountDue: (sub.activity as any).monthlyPrice,
        });
      }
    }

    return unpaid;
  }
}
