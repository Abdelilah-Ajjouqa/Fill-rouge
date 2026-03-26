import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Gym, GymSchema } from './schemas/gym.schema';
import { GymsService } from './gyms.service';
import { GymsController } from './gyms.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Gym.name, schema: GymSchema }])],
  controllers: [GymsController],
  providers: [GymsService],
  exports: [GymsService],
})
export class GymsModule {}
