# onward

Onward is a monorepo for the `Progress over perfection` product.

- `apps/web`: Vite + React service web
- `apps/mobile`: Expo + React Native mobile app
- `apps/api`: NestJS API

## Development

```bash
pnpm install
pnpm db:up
pnpm db:push
pnpm dev:web
pnpm dev:api
```

## Environment Files

- `apps/web/.env.development`: local web development values
- `apps/web/.env.production`: production web values
- `apps/web/.env.example`: web template
- `apps/api/.env.development`: local API development values
- `apps/api/.env.production`: production API values
- `apps/api/.env.example`: API template
- optional local overrides:
  - `.env.development.local`
  - `.env.production.local`

## Root Scripts

- `pnpm dev:web`: Vite 웹 앱 실행
- `pnpm dev:api`: Nest API 개발 서버 실행
- `pnpm dev:mobile`: Expo 개발 서버 실행
- `pnpm dev:mobile:ios`: iOS 시뮬레이터로 Expo 실행
- `pnpm dev:mobile:android`: Android 에뮬레이터로 Expo 실행
- `pnpm dev:mobile:web`: Expo web 실행
- `pnpm start:api`: 빌드된 Nest API를 production 모드로 실행
- `pnpm preview:web`: 빌드된 웹 앱 preview 실행
- `pnpm db:up`: Onward Docker Postgres 시작
- `pnpm db:down`: Onward Docker Postgres 종료
- `pnpm db:logs`: Onward Docker Postgres 로그 확인
- `pnpm db:generate`: Prisma Client 재생성
- `pnpm db:push`: Prisma 스키마를 DB에 반영
- `pnpm build:web`: 웹 앱만 빌드
- `pnpm build:api`: API만 빌드
- `pnpm lint:web`: 웹 앱만 린트
- `pnpm lint:api`: API만 린트
- `pnpm typecheck:web`: 웹 앱만 타입체크
- `pnpm typecheck:api`: API만 타입체크
- `pnpm verify`: lint + typecheck + build 전체 확인
