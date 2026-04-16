import type { GoalType } from '@onward/contracts';
import { clamp } from '@onward/utils';

export function calculateCompletionRate(
  completedCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) {
    return 0;
  }

  return clamp(completedCount / totalCount, 0, 1);
}

export function isRecurringGoal(goalType: GoalType): boolean {
  return goalType === 'habit' || goalType === 'challenge';
}
