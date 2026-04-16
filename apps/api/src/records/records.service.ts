import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type Record as GoalRecord } from '@prisma/client';

import type { RecordSummary } from '@onward/contracts';

import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { FindRecordsQueryDto } from './dto/find-records-query.dto';

@Injectable()
export class RecordsService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async createOrUpdate(
    user: AuthenticatedUser,
    dto: CreateRecordDto,
  ): Promise<RecordSummary> {
    await this.ensureGoalOwner(user.userId, dto.goalId);

    const performedOn = this.normalizePerformedOn(dto.performedOn);
    const record = await this.prisma.record.upsert({
      create: {
        goalId: dto.goalId,
        performedOn,
        status: dto.status,
        userId: user.userId,
      },
      update: {
        status: dto.status,
      },
      where: {
        goalId_performedOn: {
          goalId: dto.goalId,
          performedOn,
        },
      },
    });

    return this.toRecordSummary(record);
  }

  async findAll(
    user: AuthenticatedUser,
    query: FindRecordsQueryDto,
  ): Promise<RecordSummary[]> {
    if (query.goalId) {
      await this.ensureGoalOwner(user.userId, query.goalId);
    }

    const records = await this.prisma.record.findMany({
      orderBy: [
        {
          performedOn: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      take: 60,
      where: {
        goalId: query.goalId,
        userId: user.userId,
      },
    });

    return records.map((record) => this.toRecordSummary(record));
  }

  private async ensureGoalOwner(userId: string, goalId: string): Promise<void> {
    const goal = await this.prisma.goal.findFirst({
      select: {
        id: true,
      },
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal을 찾을 수 없습니다.');
    }
  }

  private normalizePerformedOn(value?: string): Date {
    const source = value ? new Date(value) : new Date();

    return new Date(
      Date.UTC(
        source.getUTCFullYear(),
        source.getUTCMonth(),
        source.getUTCDate(),
      ),
    );
  }

  private toRecordSummary(record: GoalRecord): RecordSummary {
    return {
      createdAt: record.createdAt.toISOString(),
      goalId: record.goalId,
      id: record.id,
      performedOn: record.performedOn.toISOString(),
      status: record.status,
      updatedAt: record.updatedAt.toISOString(),
      userId: record.userId,
    };
  }
}
