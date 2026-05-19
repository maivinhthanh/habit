# Tech Stack — Habit Tracker

Single Source of Truth về công nghệ. Đọc trước khi thêm dependency hoặc thay đổi kiến trúc.

---

## 1. Language & Runtime

| Thành phần | Lựa chọn | Ghi chú |
|-----------|----------|---------|
| Language | TypeScript 6.0.2 | Strict mode, ES2023 target |
| Runtime | Node.js (vite dev server) | |
| Package manager | npm | `package-lock.json` committed |

---

## 2. Frontend

| Thành phần | Lựa chọn | Ghi chú |
|-----------|----------|---------|
| Framework | React 19.2.6 | Functional components + hooks only |
| Routing | React Router 7.15.1 | `BrowserRouter`, `useNavigate` |
| Build tool | Vite 8.0.12 | `@vitejs/plugin-react` (Oxc transform) |
| Styling | Tailwind CSS 4.3.0 | Utility-first; không custom classes trừ `.input` và range |
| PWA | vite-plugin-pwa | Workbox auto-update, manifest tự động |
| PostCSS | postcss + autoprefixer | Vendor prefixing |

---

## 3. Backend

| Thành phần | Lựa chọn | Ghi chú |
|-----------|----------|---------|
| Database | Supabase (PostgreSQL) | Hosted, không self-host |
| Client SDK | @supabase/supabase-js v2 | Khởi tạo trong `src/lib/supabase.ts` |
| Auth | Không dùng | Single-user, anon key |
| Realtime | Không dùng | Poll-based (refetch sau action) |

Env vars (`.env.local`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 4. State Management

Không có global state library. Mỗi domain có 1 custom hook:

| Hook | Data source | Mutations |
|------|------------|-----------|
| `useHabits()` | `habit_stats` view | `checkIn`, `addHabit`, `updateHabit` |
| `useRewards()` | `reward_progress` view | `claimReward`, `addReward`, `updateReward` |
| `useCategories()` | `categories` table | `addCategory`, `updateCategory` |
| `usePoints()` | `current_points` view | read-only |

Pattern: fetch on mount → mutation → re-fetch. Không optimistic update.

---

## 5. Business Logic

Nằm hoàn toàn ở client (`src/lib/utils.ts`):

| Hàm | Mô tả |
|-----|-------|
| `calculateStreak(lastCheckedAt, current)` | Tính streak mới sau check-in |
| `streakBonus(streak)` | XP bonus: 50/100/200/500 tại 7/14/30/100 ngày |
| `isMilestone(streak)` | Boolean — có phải ngày milestone không |
| `isCheckedToday(lastCheckedAt)` | Guard check-in trùng ngày |
| `formatMinutes(n)` | `"90"` → `"1h 30m"` |
| `formatPoints(n)` | `1200` → `"1.2k"` |

XP formula: `base = category.points_per_minute × duration_minutes` + `streakBonus(streak_current)`

---

## 6. Routing & Layout

```
App.tsx
├── Layout (BottomNav + max-w container)
│   ├── /              → TodayPage
│   ├── /dashboard     → DashboardPage
│   ├── /streak        → StreakPage
│   ├── /rewards       → RewardsPage
│   └── /settings      → SettingsPage
├── /habits/new        → AddHabitPage (full-screen, no nav)
├── /rewards/new       → AddRewardPage (full-screen, no nav)
└── /categories/new    → AddCategoryPage (full-screen, no nav)
```

---

## 7. Design Tokens

| Token | Value | Dùng ở đâu |
|-------|-------|-----------|
| Primary | orange-500 (`#f97316`) | CTA, active nav, streaks |
| Accent | violet-600 (`#7c3aed`) | PWA theme, form accent |
| Max width | `32rem` | Mobile container |
| Border radius | `xl` (12px), `2xl` (16px) | Cards, buttons |
| Font | System stack (`-apple-system`, Segoe UI) | |

12 preset category colors: `#ef4444` `#f97316` `#eab308` `#22c55e` `#14b8a6` `#3b82f6` `#8b5cf6` `#ec4899` `#6b7280` `#0ea5e9` `#f43f5e` `#84cc16`

---

## 8. Coding Standards

- **Type hints:** Bắt buộc — không dùng `any`
- **Components:** Functional, không class component
- **Hooks:** Custom hook cho mọi Supabase interaction
- **State:** Local `useState` trong component; không Redux/Zustand
- **Async:** `async/await`, không `.then()` chain
- **Comments:** Chỉ khi WHY không rõ ràng
- **Naming:** `camelCase` functions/variables, `PascalCase` components/types

---

## 9. Build & Scripts

```bash
npm run dev      # vite (HMR)
npm run build    # tsc -b && vite build
npm run preview  # vite preview
npm run lint     # eslint .
```

Output: `dist/` (static, deployable to Vercel / Netlify / Supabase hosting)
