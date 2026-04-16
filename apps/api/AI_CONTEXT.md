# API 앱

## 범위

- `apps/api`의 NestJS 백엔드를 담당한다.
- 현재는 저장소 기초 구조와 기본 health endpoint까지 준비된 상태다.

## 주의사항

- 프론트엔드 관심사는 이 앱에 섞지 않는다.
- 컨트롤러에 복잡한 도메인 판단 로직을 넣지 않는다.
- 날짜와 timezone 처리 규칙을 엔드포인트마다 다르게 만들지 않는다.
- UI 편의를 위한 임시 응답 shape를 이 앱 안에서만 독자적으로 늘리지 않는다.

## 작업 규칙

- 백엔드 모듈은 `auth`, `users`, `goals`, `records`, `stats`처럼 도메인 기준으로 나눈다.
- 컨트롤러는 요청/응답 매핑에 집중하고, 도메인 판단은 서비스나 공용 도메인 로직으로 보낸다.
- 공용 제품 타입은 `@onward/contracts`에 둔다.
- 재사용 가능한 순수 비즈니스 로직은 `@onward/domain`에 둔다.
- 새 API를 추가할 때는 응답 타입과 에러 케이스를 함께 정리한다.

## 주요 명령어

- 개발 서버: `pnpm --filter @onward/api dev`
- 빌드: `pnpm --filter @onward/api build`
- 타입체크: `pnpm --filter @onward/api typecheck`

## 변경 후 확인

- 최소 `pnpm --filter @onward/api typecheck`를 실행한다.
- 모듈 구조나 빌드 결과에 영향을 주는 변경이면 `pnpm --filter @onward/api build`도 확인한다.
