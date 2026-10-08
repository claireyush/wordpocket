# 카드 복습 제외(일시정지) 기능

## 목표
단어장 안의 특정 카드를 복습 대상에서 빼고, 나중에 다시 넣을 수 있게 한다.

## 배경
- `card_states.status`에 이미 `suspended` 값이 있고, 리치(leech) 감지 시 자동으로 설정된다.
- 모든 학습 큐 함수(`get_study_queue`, `get_folder_review_queue`, `get_range_review_queue`, `review-only`)는 status로 필터하므로 `suspended` 카드는 이미 큐에서 빠진다.
- `get_deck_progress`도 `suspended_count`를 따로 집계한다.
- 따라서 "수동으로 status를 suspended ↔ 원래 상태로 되돌리는" 경로만 추가하면 된다.

## 페이즈
- [x] Phase 1. DB. `set_card_suspended(p_card_id, p_suspended)` RPC 마이그레이션 추가
- [x] Phase 2. 웹. 카드 편집 페이지에 "복습에서 제외" 토글, 목록에 "제외됨" 배지
- [x] Phase 3. 모바일. 동일 기능
- [ ] Phase 4. 빌드 검증 및 마이그레이션 적용
