import type { GoalType, RecordStatus } from '@onward/contracts';
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

export interface ActivityRecord {
  performedOn: string;
  status: RecordStatus;
}

export interface DailyActivity {
  date: string;
  doneCount: number;
  missedCount: number;
  skippedCount: number;
  totalCount: number;
}

function toDayKey(value: string | Date): string {
  const source = value instanceof Date ? value : new Date(value);
  return source.toISOString().slice(0, 10);
}

function buildDoneDaySet(records: ActivityRecord[]): Set<string> {
  return new Set(
    records
      .filter((record) => record.status === 'done')
      .map((record) => toDayKey(record.performedOn)),
  );
}

export function buildDailyActivity(
  records: ActivityRecord[],
  days = 7,
  endDate = new Date(),
): DailyActivity[] {
  const activityByDay = new Map<string, DailyActivity>();
  const end = new Date(
    Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()),
  );

  for (let index = days - 1; index >= 0; index -= 1) {
    const current = new Date(end);
    current.setUTCDate(end.getUTCDate() - index);
    const date = toDayKey(current);

    activityByDay.set(date, {
      date,
      doneCount: 0,
      missedCount: 0,
      skippedCount: 0,
      totalCount: 0,
    });
  }

  for (const record of records) {
    const dayKey = toDayKey(record.performedOn);
    const current = activityByDay.get(dayKey);

    if (!current) {
      continue;
    }

    current.totalCount += 1;

    if (record.status === 'done') {
      current.doneCount += 1;
    } else if (record.status === 'missed') {
      current.missedCount += 1;
    } else {
      current.skippedCount += 1;
    }
  }

  return [...activityByDay.values()];
}

export function calculateCurrentStreak(
  records: ActivityRecord[],
  endDate = new Date(),
): number {
  const doneDaySet = buildDoneDaySet(records);
  const cursor = new Date(
    Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()),
  );

  let streak = 0;

  while (doneDaySet.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export function calculateBestStreak(records: ActivityRecord[]): number {
  const doneDays = [...buildDoneDaySet(records)].sort();

  if (doneDays.length === 0) {
    return 0;
  }

  let best = 1;
  let current = 1;

  for (let index = 1; index < doneDays.length; index += 1) {
    const previous = new Date(doneDays[index - 1]);
    const currentDate = new Date(doneDays[index]);
    const diffInDays =
      (currentDate.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}
