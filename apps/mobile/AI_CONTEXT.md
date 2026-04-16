# 모바일 앱

## 범위

- `apps/mobile`의 Expo + React Native 앱을 담당한다.
- 핵심 사용자 흐름은 빠른 일일 체크인과 가벼운 기록 입력이다.

## 주의사항

- 웹과의 화면 동일성보다 모바일 사용성을 우선한다.
- 이후 알림 진입 흐름을 붙이기 쉽도록 구조를 유지한다.
- 웹 전용 레이아웃이나 상호작용 패턴을 그대로 가져오지 않는다.
- 공용화 욕심 때문에 네이티브 UI를 packages로 빼지 않는다.
- secure storage, 딥링크, 알림 같은 모바일 특화 로직을 웹 기준으로 설계하지 않는다.

## 작업 규칙

- 도메인 로직과 토큰은 packages에서 공유하되, 네이티브 UI 구현은 이 앱 안에 둔다.
- 빠른 체크인 흐름에서는 탭 수와 입력 단계를 줄이는 방향을 우선한다.
- 화면 추가 시 로딩 상태, 오류 상태, 빈 상태를 같이 고려한다.
- 모바일 전용 상태나 저장 전략은 앱 내부에서 명확히 관리한다.

## 주요 명령어

- 개발 서버: `pnpm --filter @onward/mobile dev`
- 타입체크: `pnpm --filter @onward/mobile typecheck`
- Expo 설정 확인: `pnpm --filter @onward/mobile exec expo config --type public`

## 변경 후 확인

- 최소 `pnpm --filter @onward/mobile typecheck`를 실행한다.
- Expo 설정이나 앱 메타데이터를 건드렸다면 `pnpm --filter @onward/mobile exec expo config --type public`로 해석 결과를 확인한다.
