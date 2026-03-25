import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Gym } from "src/gyms/schemas/gym.schema";

export type MemberDocument = HydratedDocument<Member>;

@Schema({ timestamps: true })
export class Member {
    @Prop({type: Types.ObjectId, ref: 'Gym', required: true})
    gymId: Gym | Types.ObjectId;

    @Prop({required: true})
    firstName: string;

    @Prop({required: true})
    lastName: string;

    @Prop({unique: true, required: true})
    email: string;

    @Prop({required: true})
    passwordHash: string;

    @Prop()
    phone?: number;

    @Prop()
    dateOfBirth?: Date;

    @Prop()
    photo?: string;

    @Prop()
    medicalCertificate?: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);