# Habit Tracker — Product Spec

**Status:** implemented (MVP)
**Owner:** maivinhthanh
**Last updated:** 2026-05-19

## Problem

Người dùng muốn xây dựng thói quen đều đặn nhưng thiếu cơ chế phản hồi rõ ràng. Không có cách dễ để theo dõi chuỗi ngày (streak), biết mình đã đầu tư bao nhiêu thời gian, hay thưởng cho bản thân khi đạt mục tiêu.

## User & Outcome

**Primary persona:** Cá nhân muốn duy trì thói quen hàng ngày (đọc sách, tập thể dục, học ngoại ngữ, v.v.), quen dùng điện thoại.

**Observable success:**
- Check-in habit hàng ngày dưới 10 giây
- Thấy streak và XP tích lũy theo thời gian
- Đặt reward và biết cần bao nhiêu ngày để đạt được

## Architecture

```
React (SPA/PWA)
    ↓ HTTP
Supabase (PostgreSQL + Views)
```

- Không có backend riêng — logic tính điểm nằm ở client (`src/lib/utils.ts`)
- Supabase views (`habit_stats`, `reward_progress`, `current_points`) xử lý aggregation phía DB
- State management: custom React hooks, không dùng global state library

## Scope

### In
- Quản lý habit: tạo, check-in hàng ngày, xem streak
- Hệ thống XP: tính điểm theo category rate × duration, bonus milestone
- Reward system: đặt mục tiêu XP, deadline, claim khi đủ điểm
- Categories: nhóm habit theo loại với màu và XP/phút riêng
- Dashboard: biểu đồ XP 7 ngày, tổng hợp stats
- PWA: cài được lên màn hình chính, offline-ready service worker
- Giao diện tiếng Việt, mobile-first

### Out
- Multi-user / authentication
- Push notifications / reminders
- Social features (chia sẻ, bạn bè)
- Import/export data
- Habit templates
- Dark mode

## Functional Requirements

### FR-1: Daily Check-in
- Mỗi habit hiển thị ở TodayPage với trạng thái pending/done
- Check-in mở modal: chọn duration (5–120 phút), ghi note tùy chọn
- Mỗi ngày chỉ check-in 1 lần/habit (blocked nếu đã check in hôm nay)
- Sau check-in: XP được tính và cộng vào tổng, streak +1, hiển thị toast

### FR-2: XP Calculation
```
base_xp = category.points_per_minute × duration_minutes
streak_bonus = streakBonus(streak_current)  // 50/100/200/500 XP tại 7/14/30/100 ngày
total_xp = base_xp + streak_bonus
```
- Bonus chỉ cộng khi đạt đúng milestone (7, 14, 30, 100)
- Không retroactive: thay đổi category rate không ảnh hưởng log cũ

### FR-3: Streak Tracking
- `calculateStreak(lastCheckedAt, currentStreak)`:
  - Hôm nay: không đổi
  - Hôm qua: +1
  - 2+ ngày trước: reset về 1
- Best streak lưu riêng, chỉ tăng không giảm

### FR-4: Rewards
- Tạo reward với: tên, mô tả, icon, XP cần (50–5000), deadline tùy chọn
- `reward_progress` view tính: `available_points`, `progress_pct`, `days_remaining`, `xp_per_day_needed`
- Claim khi `available_points >= points_required`
- Claim tiêu XP: tạo `reward_claims` record, trừ vào available_points

### FR-5: Categories
- Category có: tên, icon (emoji), màu (12 preset), `points_per_minute` (1–20)
- Habit thuộc 1 category; category quyết định màu sắc và XP rate

### FR-6: Navigation
5 tab cố định ở bottom nav:
- `/` — TodayPage (check-in)
- `/dashboard` — Analytics
- `/streak` — Streak & milestones
- `/rewards` — Rewards
- `/settings` — Quản lý habits/rewards/categories

## Non-Functional Requirements
- Mobile-first, max-width 32rem
- PWA: manifest + service worker auto-update
- Supabase cache TTL: 5 phút
- No authentication — single-user app
- Build: `tsc -b && vite build`

## Data Schema

### Tables
| Table | Key fields |
|-------|-----------|
| `categories` | name, icon, color, points_per_minute, is_active |
| `habits` | name, category_id, icon, duration_minutes, streak_current, streak_best, last_checked_at, is_active |
| `habit_logs` | habit_id, checked_at, duration_minutes, points_earned, streak_at, note |
| `rewards` | name, description, icon, points_required, target_date, is_active, is_claimed |
| `reward_claims` | reward_id, points_spent, claimed_at |

### Views
| View | Returns |
|------|---------|
| `habit_stats` | habit + category joined, checked_today, total_logs, total_minutes, total_points |
| `reward_progress` | reward + available_points, progress_pct, days_remaining, xp_per_day_needed |
| `current_points` | available_points, total_earned, total_spent |

## Related
- Tech stack: `planning/tech.md`
- Roadmap: `planning/plan.md`
