-- Recreate habit_stats view.
-- Run in Supabase SQL Editor.

DROP VIEW IF EXISTS habit_stats;

CREATE VIEW habit_stats AS
SELECT
  h.id,
  h.name,
  h.icon,
  h.duration_minutes,
  h.streak_current,
  h.streak_best,
  h.last_checked_at,
  h.is_active,
  h.category_id,
  c.name            AS category_name,
  c.icon            AS category_icon,
  c.color           AS category_color,
  c.points_per_minute,
  (h.last_checked_at::date = CURRENT_DATE) AS checked_today,
  COUNT(hl.id)                             AS total_logs,
  COALESCE(SUM(hl.duration_minutes), 0)   AS total_minutes,
  COALESCE(SUM(hl.points_earned), 0)      AS total_points
FROM habits h
JOIN categories c ON c.id = h.category_id
LEFT JOIN habit_logs hl ON hl.habit_id = h.id
GROUP BY
  h.id, h.name, h.icon, h.duration_minutes,
  h.streak_current, h.streak_best, h.last_checked_at, h.is_active,
  h.category_id, c.name, c.icon, c.color, c.points_per_minute;
