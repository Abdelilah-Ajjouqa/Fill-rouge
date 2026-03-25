import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
    @Prop({ type: Types.ObjectId, ref: 'Gym', required: true })
    gymId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Subscription', required: true })
    subscription: Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    amountDue: number;

    @Prop({ required: true })
    paidAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
