# 웹 앱

## 범위

- `apps/web`의 로그인 이후 서비스 웹 앱을 담당한다.
- 이 앱은 SSR이 아니라 `Vite + React` 기반 SPA다.

## 주의사항

- 대시보드, Goal, Record, Insights 같은 제품 사용 흐름에 최적화한다.
- SEO 랜딩 요구를 이 앱에 섞지 않는다.
- 화면 컴포넌트 안에 API 응답 가공 로직을 반복해서 두지 않는다.
- 웹 전용 편의 구현을 공용 도메인 규칙처럼 취급하지 않는다.

## 작업 규칙

- 라우팅과 앱 상태는 웹 앱 안에서 관리하고, 공용 제품 로직은 packages로 옮긴다.
- 새 화면을 추가할 때는 라우트, 로딩 상태, 오류 상태를 같이 만든다.
- 앱 여러 화면에서 재사용되는 계산 로직은 `packages/domain`으로 이동한다.
- API 응답 shape에 의존하는 매핑이 반복되면 공용 타입이나 mapper로 정리한다.

## 주요 명령어

- 개발 서버: `pnpm --filter @onward/web dev`
- 빌드: `pnpm --filter @onward/web build`
- 타입체크: `pnpm --filter @onward/web typecheck`

## 변경 후 확인

- 최소 `pnpm --filter @onward/web typecheck`를 실행한다.
- 화면 구조나 번들에 영향을 주는 변경이면 `pnpm --filter @onward/web build`도 확인한다.
