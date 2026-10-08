# 체크리스트

## Phase 1. DB
- [x] `supabase/migrations/00018_set_card_suspended.sql` 작성
- [x] `database.types.ts` (웹/모바일) Functions에 타입 추가

## Phase 2. 웹
- [x] `mapCardStatus`에 `suspended` 추가, Badge variant 추가
- [x] `CardListItem` 라벨 "제외됨"
- [x] `DeckPage` 상태순 정렬에 suspended 포함
- [x] `useCard`가 `card_states(status)`도 가져오도록 변경
- [x] `useSetCardSuspended` 훅 추가
- [x] `CardFormPage` 편집 모드에 토글 추가

## Phase 3. 모바일
- [x] 위와 동일

## Phase 4. 검증
- [x] 웹 `npm run build` 통과
- [x] 모바일 `npx tsc --noEmit` 통과
- [x] `supabase db push`로 마이그레이션 적용
