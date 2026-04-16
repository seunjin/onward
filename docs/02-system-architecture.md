# 02. System Architecture

## 1. 아키텍처 목표

Onward의 구조는 빠른 MVP 개발과 이후 확장을 동시에 고려해야 한다.

핵심 목표는 다음과 같다.

- 웹, 앱, 서버를 한 저장소에서 관리한다.
- 공통 비즈니스 규칙은 한 곳에서 관리한다.
- 플랫폼별 UI는 독립성을 유지한다.
- API 계약과 타입 중복을 줄인다.
- 기록과 통계 계산의 일관성을 서버 기준으로 맞춘다.

## 2. 권장 스택

- Package manager: `pnpm`
- Monorepo orchestration: `Turborepo`
- Language: `TypeScript`
- Service Web: `Vite + React`
- Landing Site later: separate app, consider `Astro` or `Next.js` when SEO becomes important
- Mobile: `React Native + Expo`
- Server: `NestJS`
- Database: `PostgreSQL`
- ORM: `Prisma`
- Validation: `zod`
- API contract: `OpenAPI`
- Auth: `JWT + Refresh Token`
- Infra later option: `Docker`, `GitHub Actions`, `Vercel/Expo/ECS or Railway`

## 3. 모노레포 구조

```txt
onward/
  apps/
    web/
    mobile/
    api/
    site/        # later, public SEO landing site
  packages/
    contracts/
    api-client/
    domain/
    utils/
    design-tokens/
    ui-web/
    ui-native/
    config-eslint/
    config-typescript/
  docs/
```

## 4. 앱별 책임 분리

## apps/web

역할:

- 로그인 이후 서비스 웹
- Goal 생성/편집의 메인 인터페이스
- 통계, 그래프, 히스토리 탐색
- 설정 및 계정 관리

특징:

- SPA 전제로 빠른 상호작용을 우선한다.
- 화면 밀도가 높아도 된다.
- 입력 폼과 데이터 관리 경험이 좋아야 한다.

비범위:

- SEO 최적화가 필요한 퍼블릭 랜딩 페이지

## apps/mobile

역할:

- 오늘의 할 일 빠른 체크인
- 습관/도전의 짧은 기록
- 푸시 알림과 재진입

특징:

- 가장 적은 탭으로 기록 가능해야 한다.
- 웹보다 깊은 통계보다 빠른 실행이 우선이다.

## apps/api

역할:

- 인증
- Goal, Record, Stats 관리
- streak 및 집계 계산
- 클라이언트가 사용할 일관된 응답 제공

특징:

- 기록의 원본(source of truth)
- 통계 계산 책임 보유

## apps/site

역할:

- 퍼블릭 랜딩 페이지
- 제품 소개, 기능 소개, 이후 콘텐츠/블로그 확장

특징:

- MVP에서는 생성하지 않는다.
- SEO 요구가 명확해지면 별도 앱으로 추가한다.
- 서비스 웹과 저장소는 공유하되, 배포와 렌더링 전략은 독립시킨다.

## 5. 패키지 전략

## `packages/contracts`

공유 대상:

- DTO 타입
- API response schema
- zod schema
- enum (`GoalType`, `RecordStatus`, `PeriodType`)

목적:

- 앱/웹/서버 간 타입 불일치 방지

## `packages/domain`

공유 대상:

- streak 계산 로직
- 기록 유효성 판단
- 반복 규칙 해석
- 날짜 기반 Goal 활성 여부 계산

주의:

- DB 접근 코드나 프레임워크 의존 코드는 넣지 않는다.

## `packages/api-client`

공유 대상:

- OpenAPI 기반 생성 client
- 인증 헤더 주입 wrapper

목적:

- 웹/앱이 같은 방식으로 API를 소비하게 한다.

## `packages/design-tokens`

공유 대상:

- colors
- spacing
- radius
- typography scale
- semantic token names

목적:

- 웹/앱 시각 언어 정합성 유지

## `packages/ui-web`, `packages/ui-native`

원칙:

- 컴포넌트 자체는 분리한다.
- 네이밍과 토큰만 맞춘다.

이유:

- 웹과 앱은 레이아웃, 제스처, 폼 처리, 네비게이션 제약이 다르다.
- 초기 단계에서 UI까지 공유하면 생산성이 떨어질 가능성이 높다.

## 6. 서버 모듈 구성

Nest는 아래 기준으로 모듈을 나눈다.

- `auth`
- `users`
- `goals`
- `records`
- `stats`
- `health`

후속 확장 시:

- `notifications`
- `insights`
- `admin`

## 7. 도메인 모델

## User

- id
- email
- nickname
- timezone
- createdAt

## Goal

- id
- userId
- title
- description
- type: `todo | habit | challenge`
- status: `active | archived | completed`
- cadenceType: `daily | weekly | custom`
- cadenceValue
- startDate
- endDate
- targetCount optional
- createdAt
- updatedAt

## Record

- id
- goalId
- userId
- date
- status: `done | skipped | missed`
- value optional
- note optional
- createdAt
- updatedAt

## GoalStat

- goalId
- currentStreak
- bestStreak
- completionRate7d
- completionRate30d
- totalDoneCount
- lastRecordedAt

## 8. 설계 원칙: Record 중심 모델

Onward는 체크 결과보다 기록의 축적이 중요하다.
따라서 `Goal`보다 `Record`가 분석의 중심이 된다.

원칙:

- 기록은 가능한 한 일자 단위로 정규화한다.
- streak는 저장보다 계산/캐시 전략으로 관리한다.
- 그래프 응답은 서버가 직접 조합한다.

## 9. 데이터베이스 초안

초기 테이블 후보:

- `users`
- `goals`
- `goal_schedules`
- `records`
- `refresh_tokens`

`goal_schedules` 분리 이유:

- 반복 규칙이 단순 문자열로 시작하더라도 이후 요일 선택, 기간형 도전, 횟수형 목표로 커질 가능성이 높다.

## 10. API 설계 방향

REST 기준 예시:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /goals`
- `POST /goals`
- `PATCH /goals/:id`
- `POST /records`
- `PATCH /records/:id`
- `GET /records/daily?date=YYYY-MM-DD`
- `GET /stats/dashboard`
- `GET /stats/goals/:id`

응답 원칙:

- 오늘 화면에 필요한 데이터는 하나의 응답으로 묶는다.
- 그래프 데이터는 클라이언트 조합이 아니라 서버 응답 형태로 준다.
- 날짜 및 시간대 처리는 사용자 timezone 기준으로 맞춘다.

## 11. 상태 관리 방향

## 웹

- 서버 상태: `TanStack Query`
- 폼: `react-hook-form + zod`
- 라우팅: `React Router`

원칙:

- `apps/web`는 SSR 없이 SPA로 운영한다.
- SEO는 이 앱의 1차 책임이 아니다.

## 앱

- 서버 상태: `TanStack Query`
- 내비게이션: `React Navigation` 또는 Expo Router
- 로컬 저장소: secure storage + 필요한 경우 async storage

## 12. 인증 방향

초기 구현:

- 이메일 기반 인증 또는 소셜 로그인 1종
- Access token + Refresh token
- 앱/웹 공통 인증 API 사용

주의:

- 모바일은 secure storage 저장
- 웹은 httpOnly cookie 또는 안전한 토큰 전략 중 하나를 일관되게 선택

## 13. 통계 계산 전략

서버 기준 계산 대상:

- 현재 streak
- 최고 streak
- 7일/30일 완료율
- 요일별 실천 횟수
- Goal별 누적 기록 수

초기에는 요청 시 계산으로 시작할 수 있다.
트래픽 증가 후 materialized table 또는 배치 집계를 고려한다.

## 14. 테스트 전략

- `packages/domain`: 단위 테스트 최우선
- `apps/api`: 서비스/컨트롤러 테스트 + e2e
- `apps/web`: 핵심 폼/흐름 테스트
- `apps/mobile`: 핵심 상호작용 테스트

가장 먼저 테스트해야 하는 영역:

- streak 계산
- 반복 규칙 해석
- 날짜 경계와 timezone 처리
- 기록 생성/수정 로직

## 15. 배포 전략 초안

초기에는 서비스별 배포 분리를 권장한다.

- Service Web: Vercel, Netlify, Cloudflare Pages 등 SPA 호스팅
- API: Railway, Render, ECS, Fly.io 중 선택
- Mobile: Expo EAS
- DB: Managed PostgreSQL

추후:

- Landing Site: SEO 요구에 맞는 별도 배포

모노레포이지만 배포 단위는 앱별로 분리한다.

## 16. 절대 피해야 할 것

- 웹/앱 UI를 처음부터 과도하게 공유
- 클라이언트마다 다른 통계 계산 로직
- 날짜 처리 규칙을 앱, 웹, 서버에서 다르게 구현
- 목표 유형별 예외 로직을 UI 레벨에서 직접 처리
- 앱 웹의 상호작용 요구를 랜딩 SEO 요구와 한 앱에서 동시에 최적화하려고 무리하기
