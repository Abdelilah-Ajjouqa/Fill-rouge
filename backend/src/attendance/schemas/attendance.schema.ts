import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Gym } from 'src/gyms/schemas/gym.schema';
import { Activity } from 'src/activities/schemas/activity.schema';
import { Member } from 'src/members/schema/member.schema';
import { User } from 'src/users/schemas/user.schema';

export type AttendanceDocument = HydratedDocument<Attendance>;

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
}

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Gym', required: true })
  gymId: Gym | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true })
  activityId: Activity | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  memberId: Member | Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({
    required: true,
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  markedBy?: User | Types.ObjectId;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index(
  { activityId: 1, memberId: 1, date: 1 },
  { unique: true },
);

