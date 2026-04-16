# 04. MVP Backlog

## 사용 목적

이 문서는 구현 시작 시 바로 이슈나 작업 단위로 옮길 수 있는 초기 백로그다.

우선순위 기준:

- P0: MVP를 막는 항목
- P1: MVP 완성도를 높이는 핵심 항목
- P2: 출시 후 확장 가능 항목

## P0. Foundation

### FND-001 모노레포 초기화

- `pnpm workspace` 구성
- `turbo` 구성
- 루트 스크립트 정리

완료 조건:

- 루트에서 앱/패키지 명령 실행 가능

### FND-002 앱 3종 생성

- `apps/web`
- `apps/mobile`
- `apps/api`

완료 조건:

- 세 앱 모두 개발 서버 또는 기본 실행 확인
- `apps/web`는 SPA 기준으로 동작

### FND-003 공통 패키지 세팅

- `contracts`
- `domain`
- `utils`
- `design-tokens`

완료 조건:

- 앱에서 공통 패키지 import 성공

### FND-004 공통 개발 규칙

- TypeScript strict
- ESLint
- Prettier 또는 Biome 중 하나 확정
- 환경변수 규칙 문서화
- 서비스 웹과 랜딩 사이트 분리 원칙 문서화

## P0. Auth and User

### AUT-001 사용자 스키마 정의

- users table
- timezone 필드 포함

### AUT-002 회원가입/로그인 API

- access/refresh token 발급

### AUT-003 웹 로그인 화면

- 기본 로그인 플로우

### AUT-004 앱 로그인 화면

- 토큰 저장 전략 포함

## P0. Goals

### GOL-001 Goal 도메인 모델 정의

- `todo`, `habit`, `challenge`
- status
- cadence
- 기간 설정

### GOL-002 Goal CRUD API

- 생성
- 목록 조회
- 상세 조회
- 수정
- 보관

### GOL-003 웹 Goal 관리 화면

- 생성/수정 폼
- 목록

### GOL-004 앱 Goal 생성/수정 화면

- 최소 입력 UX

## P0. Records

### REC-001 일별 기록 모델 정의

- date
- status
- optional note/value

### REC-002 오늘 해야 할 목록 API

- 사용자 timezone 반영
- 오늘 활성 Goal 필터링

### REC-003 기록 생성/수정 API

- 단건 체크
- 동일 날짜 업데이트

### REC-004 모바일 오늘 화면

- 가장 우선 구현할 화면
- 1~2번 탭으로 기록 가능해야 함

### REC-005 웹 대시보드 오늘 섹션

- 오늘 해야 할 Goal 노출
- 빠른 기록 입력

## P1. Stats and Insights

### STA-001 streak 계산 로직

- 현재 streak
- 최고 streak

### STA-002 최근 7일/30일 그래프 API

- Goal별 또는 전체 기준 선택

### STA-003 웹 인사이트 화면

- 라인/바 차트
- 누적 통계 카드

### STA-004 앱 요약 화면

- 오늘 상태
- 최근 흐름 요약

## P1. Product Quality

### QLT-001 에러 응답 규칙 통일

### QLT-002 로딩/빈 상태 UX

### QLT-003 핵심 테스트

- domain 단위 테스트
- API e2e 일부

### QLT-004 배포 환경 분리

- dev
- staging optional
- prod

## P2. Expansion

### EXP-000 퍼블릭 랜딩 사이트 분리

- `apps/site` 별도 생성
- SEO/콘텐츠 요구에 맞는 스택 선택
- `design-tokens`와 브랜드 자산 공유

### EXP-001 리마인더/푸시 알림

### EXP-002 회고 메모

### EXP-003 도전 종료 후 결과 요약

### EXP-004 소셜/공유 기능

## 구현 착수 추천 순서

1. FND-001 ~ FND-004
2. AUT-001 ~ AUT-004
3. GOL-001 ~ GOL-004
4. REC-001 ~ REC-005
5. STA-001 ~ STA-004
6. QLT-001 ~ QLT-004

## 첫 주 실행 목표

첫 주에는 아래까지 끝내는 것을 목표로 둔다.

- 모노레포 초기화
- 앱 3종 부팅
- 공통 패키지 연결
- auth 기본 구조
- Goal 생성 API
- 웹 또는 앱 한쪽에서 Goal 생성 성공

## 첫 릴리즈 전 반드시 검증할 시나리오

1. 신규 가입 후 첫 Goal 생성
2. 오늘 화면에서 기록 체크
3. 기록 후 그래프 반영 확인
4. 다른 기기에서 같은 계정으로 확인
5. timezone이 다른 환경에서도 날짜가 어긋나지 않는지 확인
