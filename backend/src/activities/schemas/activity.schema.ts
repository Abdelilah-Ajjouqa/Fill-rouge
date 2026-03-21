import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ActivityDocument = HydratedDocument<Activity>;

export class ScheduleSlot {
    day: string;
    startTime: string;
    endTime: string;
}

@Schema({ timestamps: true })
export class Activity {
    @Prop({ type: Types.ObjectId, ref: 'Gym', required: true })
    gymId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    coach: User | Types.ObjectId;

    @Prop({ required: true })
    monthlyPrice: number;

    @Prop({ required: true })
    maxCapacity: number;

    @Prop({ type: [{ day: String, startTime: String, endTime: String }], default: [] })
    schedule: ScheduleSlot[];

    @Prop({ default: true })
    isActive: boolean;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
