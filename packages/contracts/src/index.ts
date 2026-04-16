export const APP_NAME = 'Onward';
export const SLOGAN = 'Progress over perfection';

export const AUTH_PROVIDERS = ['google', 'apple'] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const GOAL_TYPES = ['todo', 'habit', 'challenge'] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export const GOAL_STATUSES = ['active', 'archived', 'completed'] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const RECORD_STATUSES = ['done', 'skipped', 'missed'] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const CADENCE_TYPES = ['daily', 'weekly', 'custom'] as const;
export type CadenceType = (typeof CADENCE_TYPES)[number];

export interface AuthUser {
  id: string;
  email: string | null;
  nickname: string | null;
  timezone: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresInDays: number;
}

export interface GoalSummary {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: GoalType;
  status: GoalStatus;
  cadenceType: CadenceType;
  cadenceValue: Record<string, unknown> | null;
  startDate: string | null;
  endDate: string | null;
  targetCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordSummary {
  id: string;
  goalId: string;
  userId: string;
  status: RecordStatus;
  performedOn: string;
  createdAt: string;
  updatedAt: string;
}
