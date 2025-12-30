# 진행 기록

## 요약
- Vite 화면이 비어 있던 문제를 `index.html`에 엔트리 스크립트 추가로 해결.
- 투표 기능을 백엔드 API/WS에 맞춰 연동하고 타입/상태 구조를 개편.
- 결과 조회 엔드포인트 명세 변동에 따라 호출 경로를 조정.
- ngrok 접근 제한 문제를 Vite allowedHosts 설정으로 해결.
- `/polls/results`가 `/polls/{pollId}`로 잘못 매칭되는 422 이슈는 백엔드 라우팅 순서 문제로 판단됨.

## 변경 사항
- `index.html`: `<script type="module" src="/index.tsx">` 추가로 React 엔트리 로드.
- `api.ts`: API base/WS URL 처리, 투표/결과 조회 함수 추가 및 정리.
- `types.ts`: Poll/Result/Vote 관련 타입 구조화.
- `App.tsx`: 전역 상태를 API 기반으로 전환, 결과 조회 + 투표 + 로컬 저장 관리.
- `pages/VotePage.tsx`: 옵션 데이터를 API에서 받아 렌더링, 실제 투표 요청 처리.
- `pages/ResultPage.tsx`: 결과를 API + WebSocket으로 실시간 갱신.
- `vite.config.ts`: ngrok 호스트 allowedHosts 추가.
- `exodusent_frontend/.env`: VITE_API_BASE_URL/VITE_WS_BASE_URL 추가 (프로젝트 루트로 이동).

## 이슈 및 확인 사항
- `Unexpected token '<'` 오류는 Vite가 `.env`를 읽지 못해 API 호출이 프론트로 향했던 문제였음.
- 결과 조회 엔드포인트는 APISPEC 기준 `/polls/results`가 맞음.
- 현재 `GET /polls/results`가 422를 반환하는 것은 백엔드 라우터가
  `/polls/{pollId}`를 먼저 매칭해서 `pollId="results"` 파싱 실패가 나는 것으로 추정됨.

## 남은 작업/요청
- 백엔드에서 `/polls/results`가 `/polls/{pollId}`보다 먼저 매칭되도록 라우팅 순서 조정 필요.
- `/polls/results`가 정상 응답되면 프론트는 결과 응답의 `pollId`로 투표/WS를 연결하도록 이미 준비됨.
