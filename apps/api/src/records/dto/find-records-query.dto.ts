import { IsOptional, IsString, MinLength } from 'class-validator';

export class FindRecordsQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  goalId?: string;
}
