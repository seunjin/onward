# Onward Planning Docs

Onward는 해야 할 일, 습관, 개인 도전을 기록하고 누적된 실천을 시각화하는 서비스다.

슬로건:

> Progress over perfection

이 문서 세트는 구현 전에 반드시 합의해야 할 제품 범위, 모노레포 구조, 도메인 모델, 구현 순서, 초기 백로그를 정리한다.

## 문서 구성

1. [01-product-strategy.md](./01-product-strategy.md)
   - 제품 방향, 사용자 가치, MVP 범위, 핵심 화면과 기능 정의
2. [02-system-architecture.md](./02-system-architecture.md)
   - 모노레포 구조, 앱/웹/서버 역할, 공용 패키지 전략, 데이터 및 API 설계 방향
3. [03-delivery-roadmap.md](./03-delivery-roadmap.md)
   - 구현 단계, 마일스톤, 품질 기준, 개발 순서
4. [04-mvp-backlog.md](./04-mvp-backlog.md)
   - 실제 구현으로 바로 옮길 수 있는 초기 작업 목록

## 추천 읽기 순서

1. 제품 전략 확정
2. 아키텍처와 도메인 설계 확정
3. 구현 로드맵 확정
4. 백로그 단위로 분해 후 개발 착수

## 현재 기준 의사결정

- 저장소 형태는 모노레포로 간다.
- 서비스 웹은 `Vite + React SPA`로 간다.
- 모바일 앱은 React Native, 서버는 NestJS를 사용한다.
- SEO가 필요한 랜딩 페이지는 MVP 범위에서 분리하고, 추후 별도 `apps/site`로 추가한다.
- 공통화는 UI보다 도메인, 타입, 토큰, API 계약 중심으로 가져간다.
- 초기 목표는 빠른 출시가 가능한 MVP 확보이며, 완성도보다 지속 사용이 가능한 핵심 루프 완성이 우선이다.
