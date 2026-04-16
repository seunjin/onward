import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  controllers: [GoalsController],
  imports: [AuthModule],
  providers: [GoalsService],
})
export class GoalsModule {}
