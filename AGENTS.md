# AGENTS.md

> 생성 파일입니다. 같은 디렉터리의 `AI_CONTEXT.md`를 수정한 뒤 `pnpm sync:ai-context`를 실행하세요.
> 원본: `AI_CONTEXT.md`
# Onward 워크스페이스

## 범위

- 이 저장소는 Onward 모노레포다.
- 제품 슬로건은 `Progress over perfection`이다.
- 주요 제품 영역은 `apps/web`, `apps/mobile`, `apps/api`다.

## 스택

- 서비스 웹: `Vite + React`
- 모바일: `Expo + React Native`
- API: `NestJS`
- 모노레포: `pnpm workspace + Turborepo`

## 공용 패키지

- `packages/contracts`: 앱과 서버가 함께 쓰는 enum, 상수, 공용 타입
- `packages/domain`: 프레임워크에 묶이지 않는 비즈니스 로직
- `packages/utils`: 범용 유틸리티
- `packages/design-tokens`: 공용 디자인 토큰
- `packages/config-*`: 공용 툴링 설정

## 주의사항

- `apps/web`는 로그인 이후의 서비스 SPA이며, SEO 랜딩 사이트가 아니다.
- 퍼블릭 랜딩 앱이 명시적으로 필요하지 않으면 아직 `apps/site`를 추가하지 않는다.
- 앱마다 같은 제품 로직을 복제하지 않는다.
- 공용 타입 없이 앱과 API가 각자 다른 계약을 정의하지 않는다.
- 도메인 계산 로직을 UI 컴포넌트 안에 오래 남겨두지 않는다.

## 작업 규칙

- 앱과 서버가 함께 쓰는 enum, 상수, 타입은 `packages/contracts`로 올린다.
- 프레임워크에 묶이지 않는 비즈니스 계산 로직은 `packages/domain`으로 올린다.
- 범용 헬퍼는 `packages/utils`에 두고, 제품 특화 로직은 `packages/domain`에 둔다.
- 웹과 모바일의 UI 구현은 각 앱에 두고, 공용화는 디자인 토큰 수준에서 시작한다.
- API 계약이 바뀌면 `contracts`, API 구현, 호출부를 한 번에 맞춘다.

## 주요 명령어

- 설치: `pnpm install`
- 전체 빌드: `pnpm build`
- 전체 린트: `pnpm lint`
- 전체 타입체크: `pnpm typecheck`
- AI 문서 동기화: `pnpm sync:ai-context`
- AI 문서 검사: `pnpm check:ai-context`

## 변경 후 확인

- 직접 수정하는 파일은 `AI_CONTEXT.md`뿐이다.
- `AGENTS.md`와 `CLAUDE.md`는 생성 파일이다.
- 어떤 `AI_CONTEXT.md`를 수정하든 이후에 `pnpm sync:ai-context`를 실행한다.
- 저장소 전반 규칙이나 공용 패키지에 영향을 주는 변경이면 `pnpm lint`와 `pnpm typecheck`를 함께 확인한다.
