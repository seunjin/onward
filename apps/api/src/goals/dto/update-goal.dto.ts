import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

import { CADENCE_TYPES, GOAL_STATUSES, GOAL_TYPES } from '@onward/contracts';

export class UpdateGoalDto {
  @IsOptional()
  @IsObject()
  cadenceValue?: Record<string, unknown>;

  @IsOptional()
  @IsIn(CADENCE_TYPES)
  cadenceType?: (typeof CADENCE_TYPES)[number];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsIn(GOAL_STATUSES)
  status?: (typeof GOAL_STATUSES)[number];

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  targetCount?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsIn(GOAL_TYPES)
  type?: (typeof GOAL_TYPES)[number];
}
