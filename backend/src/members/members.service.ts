import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from './schema/member.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema';
import { Subscription, SubscriptionDocument } from '../subscriptions/schemas/subscription.schema';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async create(createMemberDto: CreateMemberDto, gymId: string) {
    const { password, ...rest } = createMemberDto;
    const passwordHash = await bcrypt.hash(password, 10);

    const createdMember = new this.memberModel({ ...rest, passwordHash, gymId });
    return createdMember.save();
  }

  async findAll(gymId?: string) {
    const filter = gymId ? { gymId } : {};
    return this.memberModel.find(filter).select('-passwordHash').exec();
  }

  async findByCoach(coachId: string, gymId: string) {
    // 1. Fetch all activities assigned to this coach (IDs only)
    const activities = await this.activityModel
      .find({
        coach: new Types.ObjectId(coachId),
        gymId: new Types.ObjectId(gymId),
      })
      .select('_id')
      .exec();

    if (!activities.length) return [];
    const activityIds = activities.map((a) => a._id);

    // 2. Fetch all active subscriptions tied to those activities (Member IDs only)
    const subscriptions = await this.subscriptionModel
      .find({ activity: { $in: activityIds }, status: 'active' })
      .select('member')
      .exec();

    if (!subscriptions.length) return [];
    const memberIds = [...new Set(subscriptions.map((s) => String(s.member)))];

    // 3. Fetch the actual members using the collapsed unique IDs
    return this.memberModel
      .find({
        _id: { $in: memberIds },
        gymId: new Types.ObjectId(gymId),
      })
      .select('-passwordHash')
      .exec();
  }

  async findByEmail(email: string) {
    return this.memberModel.findOne({ email }).exec();
  }

  async findOne(id: string, gymId: string) {
    const member = await this.memberModel
      .findOne({ _id: id, gymId })
      .select('-passwordHash')
      .exec();
      
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found in your gym`);
    }
    
    return member;
  }

  async findById(id: string) {
    const member = await this.memberModel.findById(id).select('-passwordHash').exec();
    if (!member) {
      throw new NotFoundException(`Member not found`);
    }
    
    return member;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto, gymId: string) {
    const { password, ...rest } = updateMemberDto;
    const updateData: any = { ...rest };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedMember = await this.memberModel
      .findOneAndUpdate({ _id: id, gymId }, updateData, { new: true })
      .select('-passwordHash')
      .exec();

    if (!updatedMember) {
      throw new NotFoundException(`Member with ID "${id}" not found in your gym`);
    }

    return updatedMember;
  }

  async remove(id: string, gymId: string) {
    const deletedMember = await this.memberModel.findOneAndDelete({ _id: id, gymId }).exec();
    
    if (!deletedMember) {
      throw new NotFoundException(`Member with ID "${id}" not found in your gym`);
    }
    
    return deletedMember;
  }
}
