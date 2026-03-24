import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from './schema/member.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>
  ) {}

  async create(createMemberDto: CreateMemberDto, gymId: string) {
    const { password, ...rest } = createMemberDto;
    const passwordHash = await bcrypt.hash(password, 10);

    const createdMember = new this.memberModel({
      ...rest,
      passwordHash,
      gymId,
    });
    return createdMember.save();
  }

  async findAll(gymId: string) {
    return this.memberModel.find({ gymId }).select('-passwordHash').exec();
  }

  async findOne(id: string, gymId: string) {
    const member = await this.memberModel.findOne({ _id: id, gymId }).select('-passwordHash').exec();
    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found in your gym`);
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
