import { useEffect, useRef, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

import type {
  AuthSession,
  GoalSummary,
  GoalType,
  RecordStatus,
  RecordSummary,
} from '@onward/contracts';
import { APP_NAME, GOAL_TYPES, RECORD_STATUSES, SLOGAN } from '@onward/contracts';
import { colors, radii, spacing, typography } from '@onward/design-tokens';
import {
  buildDailyActivity,
  calculateBestStreak,
  calculateCompletionRate,
  calculateCurrentStreak,
} from '@onward/domain';

const sampleCompletionRate = Math.round(calculateCompletionRate(5, 7) * 100);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const authStorageKey = 'onward.auth.session';

interface AuthErrorState {
  message: string;
}

interface GoalFormState {
  description: string;
  targetCount: string;
  title: string;
  type: GoalType;
}

type RecordsByGoal = Record<string, RecordSummary[]>;

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-identity="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Google script load failed')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.src = 'https://accounts.google.com/gsi/client';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('Google script load failed')),
      { once: true },
    );
    document.head.append(script);
  });
}

function readStoredSession(): AuthSession | null {
  const rawValue = window.localStorage.getItem(authStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    window.localStorage.removeItem(authStorageKey);
    return null;
  }
}

function persistSession(session: AuthSession): void {
  window.localStorage.setItem(authStorageKey, JSON.stringify(session));
}

function clearStoredSession(): void {
  window.localStorage.removeItem(authStorageKey);
}

async function requestSessionRefresh(
  refreshToken: string,
): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    body: JSON.stringify({
      refreshToken,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('세션을 갱신하지 못했습니다.');
  }

  return (await response.json()) as AuthSession;
}

async function requestGoals(accessToken: string): Promise<GoalSummary[]> {
  const response = await fetch(`${apiBaseUrl}/goals`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Goal 목록을 불러오지 못했습니다.');
  }

  return (await response.json()) as GoalSummary[];
}

async function requestGoalCreate(
  accessToken: string,
  formState: GoalFormState,
): Promise<GoalSummary> {
  const response = await fetch(`${apiBaseUrl}/goals`, {
    body: JSON.stringify({
      description: formState.description || undefined,
      targetCount: formState.targetCount ? Number(formState.targetCount) : undefined,
      title: formState.title,
      type: formState.type,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Goal 생성에 실패했습니다.');
  }

  return (await response.json()) as GoalSummary;
}

async function requestRecords(accessToken: string): Promise<RecordSummary[]> {
  const response = await fetch(`${apiBaseUrl}/records`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('기록 목록을 불러오지 못했습니다.');
  }

  return (await response.json()) as RecordSummary[];
}

async function requestRecordCreate(
  accessToken: string,
  goalId: string,
  status: RecordStatus,
): Promise<RecordSummary> {
  const response = await fetch(`${apiBaseUrl}/records`, {
    body: JSON.stringify({
      goalId,
      status,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('기록 저장에 실패했습니다.');
  }

  return (await response.json()) as RecordSummary;
}

function groupRecordsByGoal(records: RecordSummary[]): RecordsByGoal {
  return records.reduce<RecordsByGoal>((grouped, record) => {
    const nextRecords = grouped[record.goalId] ?? [];
    grouped[record.goalId] = [...nextRecords, record];
    return grouped;
  }, {});
}

function getRecentCompletionRate(records: RecordSummary[]): number {
  const recentActivity = buildDailyActivity(records, 7);
  const doneCount = recentActivity.reduce(
    (sum: number, day) => sum + day.doneCount,
    0,
  );
  const totalCount = recentActivity.reduce(
    (sum: number, day) => sum + day.totalCount,
    0,
  );

  return Math.round(calculateCompletionRate(doneCount, totalCount) * 100);
}

function HomeScreen() {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [authError, setAuthError] = useState<AuthErrorState | null>(null);
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [isGoalsLoading, setIsGoalsLoading] = useState(false);
  const [isGoalSubmitting, setIsGoalSubmitting] = useState(false);
  const [isRecordSubmittingGoalId, setIsRecordSubmittingGoalId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [recordsByGoal, setRecordsByGoal] = useState<RecordsByGoal>({});
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [goalForm, setGoalForm] = useState<GoalFormState>({
    description: '',
    targetCount: '1',
    title: '',
    type: 'habit',
  });
  const allRecords = Object.values(recordsByGoal).flat();
  const weeklyActivity = buildDailyActivity(allRecords, 7);
  const currentStreak = calculateCurrentStreak(allRecords);
  const bestStreak = calculateBestStreak(allRecords);
  const weeklyDoneCount = weeklyActivity.reduce(
    (sum: number, day) => sum + day.doneCount,
    0,
  );
  const weeklyCompletionRate = Math.round(
    calculateCompletionRate(
      weeklyDoneCount,
      weeklyActivity.reduce((sum: number, day) => sum + day.totalCount, 0),
    ) * 100,
  );

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const storedSession = readStoredSession();

      if (!storedSession?.refreshToken) {
        setIsRestoring(false);
        return;
      }

      setSession(storedSession);

      try {
        const nextSession = await requestSessionRefresh(storedSession.refreshToken);

        if (cancelled) {
          return;
        }

        persistSession(nextSession);
        setSession(nextSession);
      } catch {
        clearStoredSession();
        if (!cancelled) {
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session?.accessToken) {
      setGoals([]);
      setGoalsError(null);
      setRecordsByGoal({});
      setRecordsError(null);
      return;
    }

    let cancelled = false;

    const loadGoals = async () => {
      setIsGoalsLoading(true);
      setGoalsError(null);

      try {
        const [nextGoals, nextRecords] = await Promise.all([
          requestGoals(session.accessToken),
          requestRecords(session.accessToken),
        ]);

        if (cancelled) {
          return;
        }

        setGoals(nextGoals);
        setRecordsByGoal(groupRecordsByGoal(nextRecords));
      } catch (error) {
        if (!cancelled) {
          setGoalsError(
            error instanceof Error
              ? error.message
              : 'Goal 목록을 불러오지 못했습니다.',
          );
          setRecordsError(
            error instanceof Error
              ? error.message
              : '기록 목록을 불러오지 못했습니다.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsGoalsLoading(false);
        }
      }
    };

    void loadGoals();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  useEffect(() => {
    if (!googleClientId || !buttonRef.current) {
      return;
    }

    let cancelled = false;

    const initializeGoogleLogin = async () => {
      try {
        await loadGoogleScript();

        if (cancelled || !buttonRef.current || !window.google) {
          return;
        }

        buttonRef.current.innerHTML = '';

        window.google.accounts.id.initialize({
          callback: async (response) => {
            if (!response.credential) {
              setAuthError({
                message: 'Google credential을 받지 못했습니다.',
              });
              return;
            }

            setAuthError(null);
            setIsLoading(true);

            try {
              const authResponse = await fetch(`${apiBaseUrl}/auth/google`, {
                body: JSON.stringify({
                  credential: response.credential,
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
                method: 'POST',
              });

              if (!authResponse.ok) {
                throw new Error('Google 로그인 요청이 실패했습니다.');
              }

              const nextSession = (await authResponse.json()) as AuthSession;
              persistSession(nextSession);
              setSession(nextSession);
            } catch (error) {
              setAuthError({
                message:
                  error instanceof Error
                    ? error.message
                    : 'Google 로그인 중 오류가 발생했습니다.',
              });
            } finally {
              setIsLoading(false);
            }
          },
          client_id: googleClientId,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          shape: 'pill',
          size: 'large',
          text: 'continue_with',
          theme: 'outline',
          width: 280,
        });
      } catch (error) {
        setAuthError({
          message:
            error instanceof Error
              ? error.message
              : 'Google script를 불러오지 못했습니다.',
        });
      }
    };

    void initializeGoogleLogin();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    clearStoredSession();
    setAuthError(null);
    setGoals([]);
    setGoalsError(null);
    setRecordsByGoal({});
    setRecordsError(null);
    setSession(null);
  };

  const handleGoalFieldChange = (
    field: keyof GoalFormState,
    value: string,
  ) => {
    setGoalForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleGoalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.accessToken) {
      setGoalsError('로그인 후 Goal을 생성할 수 있습니다.');
      return;
    }

    setIsGoalSubmitting(true);
    setGoalsError(null);

    try {
      const nextGoal = await requestGoalCreate(session.accessToken, goalForm);

      setGoals((current) => [nextGoal, ...current]);
      setGoalForm({
        description: '',
        targetCount: '1',
        title: '',
        type: goalForm.type,
      });
    } catch (error) {
      setGoalsError(
        error instanceof Error ? error.message : 'Goal 생성에 실패했습니다.',
      );
    } finally {
      setIsGoalSubmitting(false);
    }
  };

  const handleRecordSubmit = async (
    goalId: string,
    status: RecordStatus,
  ) => {
    if (!session?.accessToken) {
      setRecordsError('로그인 후 기록을 남길 수 있습니다.');
      return;
    }

    setIsRecordSubmittingGoalId(goalId);
    setRecordsError(null);

    try {
      const nextRecord = await requestRecordCreate(session.accessToken, goalId, status);

      setRecordsByGoal((current) => {
        const currentRecords = current[goalId] ?? [];
        const filteredRecords = currentRecords.filter(
          (record) => record.performedOn !== nextRecord.performedOn,
        );

        return {
          ...current,
          [goalId]: [nextRecord, ...filteredRecords].sort((left, right) =>
            right.performedOn.localeCompare(left.performedOn),
          ),
        };
      });
    } catch (error) {
      setRecordsError(
        error instanceof Error ? error.message : '기록 저장에 실패했습니다.',
      );
    } finally {
      setIsRecordSubmittingGoalId(null);
    }
  };

  return (
    <section className="card">
      <span className="eyebrow">Milestone 0</span>
      <h1>{APP_NAME}</h1>
      <p>{SLOGAN}</p>
      <p>
        Vite 기반 서비스 웹의 기본 골격이 준비되었습니다. 다음 단계에서는
        인증, Goal, Record, Insights 흐름을 이 위에 쌓습니다.
      </p>
      <div className="stats">
        <div>
          <strong>{sampleCompletionRate}%</strong>
          <span>sample completion</span>
        </div>
        <div>
          <strong>{GOAL_TYPES.length}</strong>
          <span>goal types</span>
        </div>
      </div>

      <section className="auth-panel">
        <div>
          <span className="eyebrow eyebrow-secondary">Google Login</span>
          <h2>웹 개발용 소셜 로그인 흐름</h2>
          <p>
            브라우저에서 Google credential을 받고, Nest 서버가 이를 검증한 뒤
            Onward 세션을 발급합니다.
          </p>
        </div>

        {!googleClientId ? (
          <p className="auth-hint">
            `apps/web/.env.development`의 `VITE_GOOGLE_CLIENT_ID`가 비어 있습니다.
          </p>
        ) : (
          <div className="google-login">
            <div ref={buttonRef} />
            {isLoading || isRestoring ? (
              <span className="auth-status">
                {isRestoring ? '세션 확인 중...' : '로그인 중...'}
              </span>
            ) : null}
            {authError ? (
              <p className="auth-error">{authError.message}</p>
            ) : null}
          </div>
        )}

        {session ? (
          <div className="session-card">
            <strong>{session.user.nickname ?? session.user.email ?? 'Onward user'}</strong>
            <span>{session.user.email ?? 'email not shared'}</span>
            <span>access expires in {session.accessTokenExpiresIn}</span>
            <button className="logout-button" onClick={handleLogout} type="button">
              로그아웃
            </button>
          </div>
        ) : null}
      </section>

      <section className="goals-panel">
        <div>
          <span className="eyebrow eyebrow-secondary">Goals</span>
          <h2>로그인 후 Goal 흐름 연결</h2>
          <p>
            현재 사용자의 Goal 목록을 불러오고, 같은 화면에서 새 Goal을 바로
            생성할 수 있습니다.
          </p>
        </div>

        {session ? (
          <div className="dashboard-stats">
            <div className="stat-card">
              <strong>{currentStreak}일</strong>
              <span>current streak</span>
            </div>
            <div className="stat-card">
              <strong>{bestStreak}일</strong>
              <span>best streak</span>
            </div>
            <div className="stat-card">
              <strong>{weeklyDoneCount}</strong>
              <span>최근 7일 done</span>
            </div>
            <div className="stat-card">
              <strong>{weeklyCompletionRate}%</strong>
              <span>최근 7일 completion</span>
            </div>
          </div>
        ) : null}

        {session ? (
          <div className="weekly-strip">
            {weeklyActivity.map((day: (typeof weeklyActivity)[number]) => {
              const intensity =
                day.doneCount > 0 ? 'is-done' : day.missedCount > 0 ? 'is-missed' : '';

              return (
                <div className="weekly-day" key={day.date}>
                  <span>{day.date.slice(5)}</span>
                  <strong className={intensity || 'is-empty'}>{day.doneCount}</strong>
                </div>
              );
            })}
          </div>
        ) : null}

        {session ? (
          <div className="goals-grid">
            <form className="goal-form" onSubmit={handleGoalSubmit}>
              <label>
                제목
                <input
                  onChange={(event) =>
                    handleGoalFieldChange('title', event.target.value)
                  }
                  placeholder="예: 매일 20분 기록하기"
                  required
                  value={goalForm.title}
                />
              </label>

              <label>
                타입
                <select
                  onChange={(event) =>
                    handleGoalFieldChange('type', event.target.value)
                  }
                  value={goalForm.type}
                >
                  {GOAL_TYPES.map((goalType) => (
                    <option key={goalType} value={goalType}>
                      {goalType}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                설명
                <textarea
                  onChange={(event) =>
                    handleGoalFieldChange('description', event.target.value)
                  }
                  placeholder="조금 서툴러도 계속 쌓아갈 실천을 적어보세요."
                  rows={3}
                  value={goalForm.description}
                />
              </label>

              <label>
                목표 횟수
                <input
                  min="1"
                  onChange={(event) =>
                    handleGoalFieldChange('targetCount', event.target.value)
                  }
                  type="number"
                  value={goalForm.targetCount}
                />
              </label>

              <button className="primary-button" disabled={isGoalSubmitting} type="submit">
                {isGoalSubmitting ? '생성 중...' : 'Goal 만들기'}
              </button>
            </form>

            <div className="goal-list-card">
              {isGoalsLoading ? (
                <p className="auth-status">Goal 목록을 불러오는 중...</p>
              ) : null}
              {goalsError ? <p className="auth-error">{goalsError}</p> : null}
              {recordsError ? <p className="auth-error">{recordsError}</p> : null}
              {!isGoalsLoading && goals.length === 0 ? (
                <p className="auth-hint">아직 Goal이 없습니다. 첫 Goal을 만들어보세요.</p>
              ) : null}
              <div className="goal-list">
                {goals.map((goal) => (
                  <article className="goal-item" key={goal.id}>
                    {(() => {
                      const goalRecords = recordsByGoal[goal.id] ?? [];
                      const goalStreak = calculateCurrentStreak(goalRecords);
                      const goalCompletionRate = getRecentCompletionRate(goalRecords);

                      return (
                        <>
                          <div className="goal-item-head">
                            <strong>{goal.title}</strong>
                            <span>{goal.type}</span>
                          </div>
                          <p>{goal.description ?? '설명 없음'}</p>
                          <span>
                            target {goal.targetCount ?? 1} · status {goal.status}
                          </span>
                          <span>
                            streak {goalStreak}일 · 최근 7일 completion {goalCompletionRate}%
                          </span>
                        </>
                      );
                    })()}
                    <div className="record-actions">
                      {RECORD_STATUSES.map((recordStatus) => (
                        <button
                          className="record-button"
                          disabled={isRecordSubmittingGoalId === goal.id}
                          key={recordStatus}
                          onClick={() => handleRecordSubmit(goal.id, recordStatus)}
                          type="button"
                        >
                          {recordStatus}
                        </button>
                      ))}
                    </div>
                    <div className="record-list">
                      {(recordsByGoal[goal.id] ?? []).slice(0, 5).map((record) => (
                        <div className="record-item" key={record.id}>
                          <strong>{record.status}</strong>
                          <span>{record.performedOn.slice(0, 10)}</span>
                        </div>
                      ))}
                      {(recordsByGoal[goal.id] ?? []).length === 0 ? (
                        <span className="auth-hint">아직 기록이 없습니다.</span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="auth-hint">Goal 목록과 생성은 로그인 후 사용할 수 있습니다.</p>
        )}
      </section>
    </section>
  );
}

function SettingsScreen() {
  return (
    <section className="card">
      <span className="eyebrow">Workspace</span>
      <h2>Shared foundations are connected</h2>
      <ul className="list">
        <li>contracts: shared product enums and copy</li>
        <li>domain: reusable product logic</li>
        <li>design-tokens: base visual tokens</li>
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <main
      className="app-shell"
      style={{
        ['--color-background' as string]: colors.background,
        ['--color-panel' as string]: colors.panel,
        ['--color-text' as string]: colors.text,
        ['--color-muted' as string]: colors.textMuted,
        ['--color-accent' as string]: colors.accent,
        ['--space-lg' as string]: `${spacing.lg}px`,
        ['--space-xl' as string]: `${spacing.xl}px`,
        ['--radius-lg' as string]: `${radii.lg}px`,
        ['--title-size' as string]: `${typography.title}px`,
      }}
    >
      <header className="topbar">
        <div>
          <span className="brand-mark" />
          <span className="brand-name">{APP_NAME}</span>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </main>
  );
}
