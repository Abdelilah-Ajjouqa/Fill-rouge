import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GymDocument = HydratedDocument<Gym>;

@Schema({ _id: true })
export class Hall {
  _id?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  type: string;

  @Prop({ required: true, min: 1 })
  capacity: number;
}

export const HallSchema = SchemaFactory.createForClass(Hall);

@Schema({ timestamps: true })
export class Gym {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  logo: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [HallSchema], default: [] })
  halls: Hall[];
}

export const GymSchema = SchemaFactory.createForClass(Gym);
