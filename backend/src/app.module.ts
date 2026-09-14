import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ActivitiesModule } from './activities/activities.module';
import { GymsModule } from './gyms/gyms.module';
import { MongodbConfig } from './config/Mongodb.config';
import { MembersModule } from './members/members.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: MongodbConfig,
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),

    UsersModule,
    AuthModule,
    ActivitiesModule,
    GymsModule,
    MembersModule,
    SubscriptionsModule,
    PaymentsModule,
    AttendanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
