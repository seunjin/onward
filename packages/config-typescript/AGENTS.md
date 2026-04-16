# AGENTS.md

> 생성 파일입니다. 같은 디렉터리의 `AI_CONTEXT.md`를 수정한 뒤 `pnpm sync:ai-context`를 실행하세요.
> 원본: `AI_CONTEXT.md`
# TypeScript 설정 패키지

## 범위

- 모노레포에서 공용으로 쓰는 TypeScript preset을 담당한다.

## 주의사항

- `react-vite`, `react-native`, `nest`, `library`처럼 런타임 성격에 따라 preset을 나눈다.
- 모듈 시스템 변경은 하위 빌드 결과에 영향을 주므로 특히 주의한다.
- 한 앱의 편의를 위해 전체 모노레포의 모듈 해석 방식을 쉽게 바꾸지 않는다.

## 작업 규칙

- 워크스페이스 전반의 기본 컴파일러 설정을 일관되게 유지한다.
- 앱 성격에 따라 preset을 분리하되, 중복 옵션은 base로 끌어올린다.
- 빌드 산출이 필요한 패키지와 noEmit 앱 설정의 차이를 명확히 유지한다.

## 변경 후 확인

- 최소 루트에서 `pnpm typecheck`를 실행한다.
- 모듈 설정을 바꿨다면 `pnpm build`까지 확인한다.
