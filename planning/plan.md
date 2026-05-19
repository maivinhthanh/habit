# Habit Tracker — Implementation Plan

**Started:** 2026-05-19
**Spec:** planning/spec.md

## Current State

MVP đã implement đầy đủ trong 1 commit (`init`). Các tính năng core hoạt động. Không có test, không có CI.

## Phases

### Phase 1 — MVP Core ✅
- [x] Project scaffold (Vite + React + TypeScript + Tailwind)
- [x] Supabase schema: tables `categories`, `habits`, `habit_logs`, `rewards`, `reward_claims`
- [x] Supabase views: `habit_stats`, `reward_progress`, `current_points`
- [x] Custom hooks: `useHabits`, `useRewards`, `useCategories`, `usePoints`
- [x] Business logic: `calculateStreak`, `streakBonus`, `isMilestone` (`src/lib/utils.ts`)
- [x] TodayPage: weekly calendar, check-in modal, duration slider, notes
- [x] StreakPage: stats, milestone badges
- [x] RewardsPage: progress bar, deadline countdown, claim flow
- [x] DashboardPage: 7-day XP chart, stat cards
- [x] SettingsPage: list habits/rewards/categories
- [x] AddHabitPage / AddRewardPage / AddCategoryPage: full-screen forms
- [x] BottomNav (5 tabs) + Layout wrapper
- [x] PWA config (manifest, service worker auto-update)
- [x] Mobile-first styling (max-width 32rem, safe area insets)

### Phase 2 — Polish & Stability
- [ ] P2-1: Sửa UI inconsistency — BottomNav và TodayPage (tracked trên git, chưa commit)
- [ ] P2-2: Toast positioning — đặt cố định trên BottomNav, không bị che
- [ ] P2-3: Empty states — hiển thị khi chưa có habit/reward nào
- [ ] P2-4: Loading states — skeleton hoặc spinner trong khi fetch Supabase
- [ ] P2-5: Error handling — toast khi Supabase call thất bại

### Phase 3 — Edit & Delete
- [ ] P3-1: Edit habit — mở form với data hiện tại, save lại
- [ ] P3-2: Edit reward — tương tự
- [ ] P3-3: Edit category — tương tự
- [ ] P3-4: Deactivate habit (soft delete) — `is_active = false`, ẩn khỏi TodayPage
- [ ] P3-5: Deactivate reward (soft delete)

### Phase 4 — UX Improvements
- [ ] P4-1: Check-in history — xem lại log của từng habit
- [ ] P4-2: Habit reorder — kéo thả hoặc up/down buttons
- [ ] P4-3: Dashboard date range — chọn 7d / 30d / all time
- [ ] P4-4: Streak calendar heatmap — visualize ngày check-in

### Phase 5 — Data & Reliability
- [ ] P5-1: Offline detection — banner khi mất mạng
- [ ] P5-2: Optimistic updates — UI cập nhật trước khi Supabase confirm
- [ ] P5-3: Data export — JSON download toàn bộ logs
- [ ] P5-4: Supabase RLS — Row Level Security nếu thêm multi-user

## Status Log

| Date | Note |
|------|------|
| 2026-05-19 | Planning files khởi tạo từ codebase thực tế. MVP hoàn chỉnh, bắt đầu Phase 2. |

## Decisions

- **Không global state:** Local hooks + refetch — đơn giản hơn cho single-user app, tránh over-engineering
- **Logic tính điểm ở client:** Không cần server function; dễ test và debug; đủ cho use case hiện tại
- **Supabase views cho aggregation:** Giảm round-trips, DB xử lý join tốt hơn client
- **Soft delete thay vì hard delete:** Giữ lịch sử logs nguyên vẹn khi deactivate habit
- **Không auth:** Single-user app, anon key đủ dùng; thêm auth khi cần multi-device sync
