import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type Goal, Prisma } from '@prisma/client';

import type { GoalSummary } from '@onward/contracts';

import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async create(
    user: AuthenticatedUser,
    dto: CreateGoalDto,
  ): Promise<GoalSummary> {
    const goal = await this.prisma.goal.create({
      data: this.buildGoalCreateInput(user.userId, dto),
    });

    return this.toGoalSummary(goal);
  }

  async findAll(user: AuthenticatedUser): Promise<GoalSummary[]> {
    const goals = await this.prisma.goal.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        userId: user.userId,
      },
    });

    return goals.map((goal) => this.toGoalSummary(goal));
  }

  async findOne(user: AuthenticatedUser, goalId: string): Promise<GoalSummary> {
    const goal = await this.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: user.userId,
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal을 찾을 수 없습니다.');
    }

    return this.toGoalSummary(goal);
  }

  async update(
    user: AuthenticatedUser,
    goalId: string,
    dto: UpdateGoalDto,
  ): Promise<GoalSummary> {
    await this.ensureGoalOwner(user.userId, goalId);

    const goal = await this.prisma.goal.update({
      data: this.buildGoalUpdateInput(dto),
      where: {
        id: goalId,
      },
    });

    return this.toGoalSummary(goal);
  }

  private async ensureGoalOwner(userId: string, goalId: string): Promise<void> {
    const goal = await this.prisma.goal.findFirst({
      select: { id: true },
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal을 찾을 수 없습니다.');
    }
  }

  private buildGoalCreateInput(
    userId: string,
    dto: CreateGoalDto,
  ): Prisma.GoalCreateInput {
    return {
      cadenceType: dto.cadenceType ?? 'daily',
      cadenceValue: this.toJsonValue(dto.cadenceValue),
      description: dto.description ?? null,
      endDate: this.toDate(dto.endDate),
      startDate: this.toDate(dto.startDate),
      status: dto.status ?? 'active',
      targetCount: dto.targetCount ?? null,
      title: dto.title,
      type: dto.type,
      user: {
        connect: { id: userId },
      },
    };
  }

  private buildGoalUpdateInput(dto: UpdateGoalDto): Prisma.GoalUpdateInput {
    return {
      cadenceType: dto.cadenceType,
      cadenceValue:
        dto.cadenceValue === undefined
          ? undefined
          : this.toJsonValue(dto.cadenceValue),
      description: dto.description,
      endDate: dto.endDate === undefined ? undefined : this.toDate(dto.endDate),
      startDate:
        dto.startDate === undefined ? undefined : this.toDate(dto.startDate),
      status: dto.status,
      targetCount: dto.targetCount,
      title: dto.title,
      type: dto.type,
    };
  }

  private toDate(value?: string): Date | null {
    return value ? new Date(value) : null;
  }

  private toGoalSummary(goal: Goal): GoalSummary {
    return {
      cadenceType: goal.cadenceType,
      cadenceValue: (goal.cadenceValue as Record<string, unknown> | null) ?? null,
      createdAt: goal.createdAt.toISOString(),
      description: goal.description,
      endDate: goal.endDate ? goal.endDate.toISOString() : null,
      id: goal.id,
      startDate: goal.startDate ? goal.startDate.toISOString() : null,
      status: goal.status,
      targetCount: goal.targetCount,
      title: goal.title,
      type: goal.type,
      updatedAt: goal.updatedAt.toISOString(),
      userId: goal.userId,
    };
  }

  private toJsonValue(
    value?: Record<string, unknown> | null,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }
}
