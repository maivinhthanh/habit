-- Paste vào Supabase SQL Editor rồi chạy.
-- Function này thực hiện claim reward trong 1 transaction atomic:
--   1. Kiểm tra reward tồn tại và chưa được đổi
--   2. Kiểm tra đủ điểm
--   3. Ghi vào reward_claims
--   4. Đánh dấu rewards.is_claimed = true

CREATE OR REPLACE FUNCTION public.claim_reward(p_reward_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reward    rewards%ROWTYPE;
  v_available INTEGER;
BEGIN
  -- Lock row để tránh race condition khi claim đồng thời
  SELECT * INTO v_reward
  FROM rewards
  WHERE id = p_reward_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'reward_not_found');
  END IF;

  IF v_reward.is_claimed THEN
    RETURN jsonb_build_object('error', 'already_claimed');
  END IF;

  SELECT COALESCE((SELECT available_points FROM current_points LIMIT 1), 0)
  INTO v_available;

  IF v_available < v_reward.points_required THEN
    RETURN jsonb_build_object('error', 'not_enough_points');
  END IF;

  INSERT INTO reward_claims (reward_id, points_spent, claimed_at)
  VALUES (p_reward_id, v_reward.points_required, NOW());

  UPDATE rewards
  SET is_claimed = TRUE
  WHERE id = p_reward_id;

  RETURN jsonb_build_object('error', NULL, 'points_spent', v_reward.points_required);
END;
$$;
