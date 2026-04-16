import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { GoalsModule } from './goals/goals.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RecordsModule } from './records/records.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}.local`,
        '.env.local',
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env',
      ],
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    GoalsModule,
    RecordsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
