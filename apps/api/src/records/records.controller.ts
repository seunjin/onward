import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';

import type { RecordSummary } from '@onward/contracts';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { CreateRecordDto } from './dto/create-record.dto';
import { FindRecordsQueryDto } from './dto/find-records-query.dto';
import { RecordsService } from './records.service';

@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordsController {
  constructor(
    @Inject(RecordsService)
    private readonly recordsService: RecordsService,
  ) {}

  @Post()
  createOrUpdate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRecordDto,
  ): Promise<RecordSummary> {
    return this.recordsService.createOrUpdate(user, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindRecordsQueryDto,
  ): Promise<RecordSummary[]> {
    return this.recordsService.findAll(user, query);
  }
}
