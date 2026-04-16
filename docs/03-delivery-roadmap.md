# 03. Delivery Roadmap

## 1. 개발 전략

Onward는 큰 기능을 한 번에 만들기보다, 제품 루프를 먼저 완성하고 그 위에 확장 기능을 쌓는 순서가 맞다.

핵심 루프는 아래와 같다.

1. Goal을 만든다.
2. 오늘 해야 할 항목으로 본다.
3. 기록한다.
4. 그래프로 확인한다.
5. 다시 돌아온다.

MVP는 이 루프가 웹과 앱에서 모두 성립하면 된다.

## 2. 마일스톤

## Milestone 0. Repository Foundation

목표:

- 모노레포 골격 완성
- 공통 설정과 개발 규칙 정리
- 서비스 웹 SPA 개발 기반 확보

산출물:

- `pnpm-workspace.yaml`
- 루트 `package.json`
- `turbo.json`
- 공통 TypeScript/ESLint 설정
- 앱 3종 기본 생성
- CI 기본 파이프라인 초안

완료 기준:

- `pnpm install`
- 각 앱의 기본 dev 실행 가능
- 공통 패키지 import 가능
- `apps/web`는 SPA 기준으로 정상 라우팅 가능

## Milestone 1. Domain and Auth

목표:

- 사용자와 Goal의 최소 구조 확보
- 인증 흐름 확보

산출물:

- `users`, `goals`, `refresh_tokens` 기본 스키마
- 회원가입/로그인/토큰 갱신
- 공통 auth guard
- Goal 생성/조회/수정 API

완료 기준:

- 로그인 후 Goal CRUD 가능
- 웹과 앱 모두 동일 계정으로 접근 가능

## Milestone 2. Daily Record Loop

목표:

- 오늘 화면과 일별 기록 흐름 완성

산출물:

- 오늘 해야 할 Goal 조회 API
- 일별 기록 생성/수정 API
- 모바일 오늘 화면
- 웹 대시보드 오늘 섹션

완료 기준:

- 사용자가 Goal을 만든 뒤 같은 날 기록 가능
- 서버에 기록 저장 후 즉시 조회 가능

## Milestone 3. Insights and Streak

목표:

- 사용자에게 누적 가치를 보여주는 최소 통계 제공

산출물:

- streak 계산
- 7일/30일 그래프 응답
- Goal별 요약 통계
- 웹 통계 화면
- 앱 간단 통계 카드

완료 기준:

- 기록이 그래프와 요약 카드에 반영됨
- streak 계산이 테스트 케이스를 통과함

## Milestone 4. Release Hardening

목표:

- 실제 배포 가능한 수준의 안정성 확보

산출물:

- 에러 처리 통일
- 로깅/모니터링 최소 구성
- 빈 상태/예외 상태 UX
- 기본 QA 시나리오
- 배포 설정

완료 기준:

- 주요 흐름에서 blocker 급 버그 없음
- 웹, 앱, 서버 각각 배포 가능

## 3. 권장 구현 순서

### 1단계: 기본 골격

- 모노레포 생성
- 앱 3종 생성
- 공통 패키지 연결

### 2단계: 공통 도메인

- `GoalType`, `RecordStatus`, 날짜 유틸 정의
- 반복 규칙 및 streak 계산 함수 정의

### 3단계: 서버 핵심

- Prisma schema
- Nest module 구성
- auth/goals/records/stats API 순으로 구현

### 4단계: 웹 핵심

- 인증
- 대시보드
- Goal 관리
- 그래프 화면

전제:

- 웹은 `Vite + React` 기반 SPA로 진행
- 랜딩 페이지는 이 단계 범위에 포함하지 않음

### 5단계: 앱 핵심

- 인증
- 오늘 화면
- 빠른 기록 흐름
- 요약 화면

### 6단계: 안정화

- 테스트 보강
- 로딩/에러 상태 정리
- 배포

## 4. 트랙별 병렬 작업 전략

구현이 시작되면 아래처럼 병렬화할 수 있다.

### Track A. Platform Foundation

- 모노레포 설정
- lint/test/build 스크립트
- 환경변수 규칙

### Track B. Backend Core

- DB 모델
- auth
- goals
- records
- stats

### Track C. Frontend Web

- 라우팅
- auth 화면
- dashboard
- goals
- insights

원칙:

- 서비스 웹은 로그인 이후 핵심 제품 루프에만 집중
- 퍼블릭 랜딩 요구는 별도 트랙으로 미룬다.

### Track D. Frontend Mobile

- navigation
- auth
- today
- quick record
- summary

단, Track B의 API 계약이 먼저 안정되어야 Frontend 병렬 속도가 나온다.

## 5. 기술 부채를 미리 막는 규칙

- 날짜 계산 유틸은 반드시 공용 패키지에서 관리
- API schema 변경 시 `contracts`와 `api-client`를 함께 갱신
- 통계 계산 로직을 클라이언트로 복제하지 않음
- 모바일 전용 UX를 웹 구조에 억지로 맞추지 않음

## 6. 품질 기준

각 마일스톤 공통 품질 기준:

- 타입 에러 없음
- lint 통과
- 핵심 단위 테스트 통과
- API 예외 케이스 최소 처리
- 빈 상태 및 에러 상태 화면 존재

## 7. 리스크와 대응

### 리스크 1. Goal 유형이 늘수록 복잡도 증가

대응:

- 초기에는 `todo`, `habit`, `challenge`의 UI 차이보다 데이터 모델 차이를 최소화한다.
- 내부적으로는 공통 Goal 모델을 유지하고 일부 속성만 분기한다.

### 리스크 2. timezone 이슈

대응:

- 사용자 timezone을 프로필에 저장
- 기록은 서버에서 timezone-aware 처리
- 테스트 케이스에 날짜 경계 포함

### 리스크 3. 통계 응답 성능

대응:

- 초기에는 단순 계산
- 이후 캐시나 집계 테이블 추가

### 리스크 4. 웹/앱 UI 공유 욕심

대응:

- 디자인 토큰까지만 공유
- UI 공유는 두 플랫폼 모두에서 반복되는 패턴이 검증된 뒤 검토

### 리스크 5. 서비스 웹과 랜딩 요구가 충돌

대응:

- 초기에는 서비스 웹을 SPA로 단순하게 유지
- SEO 랜딩이 필요해지면 `apps/site`를 별도 앱으로 추가
- 두 앱은 브랜드 토큰과 공통 자산만 공유

## 8. 구현 시작 전 체크리스트

- MVP 범위 확정
- 로그인 방식 확정
- Expo 사용 여부 확정
- DB/배포 후보 확정
- 디자인 토큰 최소 세트 확정
- API 네이밍 규칙 확정
- 랜딩 사이트는 별도 앱으로 분리한다는 원칙 확인

이 체크리스트가 정리되면 바로 Milestone 0 구현에 들어갈 수 있다.
