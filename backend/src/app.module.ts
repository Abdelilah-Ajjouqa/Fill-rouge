import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ActivitiesModule } from './activities/activities.module';
import { GymsModule } from './gyms/gyms.module';
import { MongodbConfig } from './config/Mongodb.config';
import { MembersModule } from './members/members.module';

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

    UsersModule,
    AuthModule,
    ActivitiesModule,
    GymsModule,
    MembersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
