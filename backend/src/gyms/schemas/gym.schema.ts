import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GymDocument = HydratedDocument<Gym>;

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
}

export const GymSchema = SchemaFactory.createForClass(Gym);
