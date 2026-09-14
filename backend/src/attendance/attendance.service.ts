import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Attendance,
  AttendanceDocument,
  AttendanceStatus,
} from './schemas/attendance.schema';
import { CheckInDto } from './dto/check-in.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
  ) {}

  private normalizeDate(dateInput?: string | Date): Date {
    const d = dateInput ? new Date(dateInput) : new Date();
    // Normalize to midnight UTC
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
  }

  async checkIn(
    checkInDto: CheckInDto,
    gymId: string,
    markedById: string,
  ): Promise<Attendance> {
    const normalizedDate = this.normalizeDate(checkInDto.date);
    const gymObjId = new Types.ObjectId(gymId);
    const activityObjId = new Types.ObjectId(checkInDto.activityId);
    const memberObjId = new Types.ObjectId(checkInDto.memberId);
    const markedByObjId = new Types.ObjectId(markedById);

    const status = checkInDto.status || AttendanceStatus.PRESENT;

    const record = await this.attendanceModel
      .findOneAndUpdate(
        {
          gymId: gymObjId,
          activityId: activityObjId,
          memberId: memberObjId,
          date: normalizedDate,
        },
        {
          $set: {
            status,
            markedBy: markedByObjId,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .populate('memberId', 'firstName lastName email photo phone')
      .populate('markedBy', 'firstName lastName email')
      .exec();

    return record;
  }

  async getTodayAttendance(
    activityId: string,
    gymId: string,
    dateStr?: string,
  ): Promise<Attendance[]> {
    const normalizedDate = this.normalizeDate(dateStr);
    const gymObjId = new Types.ObjectId(gymId);
    const activityObjId = new Types.ObjectId(activityId);

    return this.attendanceModel
      .find({
        gymId: gymObjId,
        activityId: activityObjId,
        date: normalizedDate,
      })
      .populate('memberId', 'firstName lastName email photo phone')
      .populate('markedBy', 'firstName lastName')
      .exec();
  }

  async getMemberAttendance(
    memberId: string,
    gymId: string,
  ): Promise<Attendance[]> {
    const gymObjId = new Types.ObjectId(gymId);
    const memberObjId = new Types.ObjectId(memberId);

    return this.attendanceModel
      .find({
        gymId: gymObjId,
        memberId: memberObjId,
      })
      .populate('activityId', 'name schedule')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 })
      .exec();
  }
}

