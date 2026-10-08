-- ============================================
-- 카드 복습 제외/복원: card_states.status를 suspended로 바꾸거나 원래 상태로 되돌림
-- ============================================

CREATE OR REPLACE FUNCTION set_card_suspended(
  p_card_id   UUID,
  p_suspended BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_state   card_states%ROWTYPE;
BEGIN
  SELECT * INTO v_state
  FROM card_states
  WHERE card_id = p_card_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'card_state not found for card %', p_card_id;
  END IF;

  IF p_suspended THEN
    UPDATE card_states
    SET status = 'suspended'
    WHERE id = v_state.id;
    RETURN;
  END IF;

  -- 복원: 학습 이력에 따라 돌아갈 상태 결정
  IF v_state."interval" >= 1 THEN
    UPDATE card_states
    SET status = 'review', lapse_count = 0
    WHERE id = v_state.id;
  ELSIF v_state.last_reviewed_at IS NOT NULL THEN
    UPDATE card_states
    SET status = 'learning', step_index = 0, due_date = now(), lapse_count = 0
    WHERE id = v_state.id;
  ELSE
    UPDATE card_states
    SET status = 'new', step_index = 0, due_date = now(), lapse_count = 0
    WHERE id = v_state.id;
  END IF;
END;
$$;
