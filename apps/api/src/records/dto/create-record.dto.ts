import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

import { RECORD_STATUSES } from '@onward/contracts';

export class CreateRecordDto {
  @IsString()
  @MinLength(1)
  goalId!: string;

  @IsOptional()
  @IsDateString()
  performedOn?: string;

  @IsIn(RECORD_STATUSES)
  status!: (typeof RECORD_STATUSES)[number];
}
