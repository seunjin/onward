import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { GoalSummary } from '@onward/contracts';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalsService } from './goals.service';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGoalDto,
  ): Promise<GoalSummary> {
    return this.goalsService.create(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<GoalSummary[]> {
    return this.goalsService.findAll(user);
  }

  @Get(':goalId')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('goalId') goalId: string,
  ): Promise<GoalSummary> {
    return this.goalsService.findOne(user, goalId);
  }

  @Patch(':goalId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('goalId') goalId: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<GoalSummary> {
    return this.goalsService.update(user, goalId, dto);
  }
}
