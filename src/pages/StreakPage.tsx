import { useHabits } from '../hooks/useHabits'
import { useWeekLogs, getWeekDays } from '../hooks/useWeekLogs'
import { formatMinutes } from '../lib/utils'
import type { HabitStat } from '../types/database'

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const todayStr = new Date().toISOString().slice(0, 10)

export function StreakPage() {
  const { habits, loading } = useHabits()
  const { logMap } = useWeekLogs()

  const weekDays = getWeekDays()
  const totalMinutes = habits.reduce((s, h) => s + (h.total_minutes ?? 0), 0)
  const totalPoints = habits.reduce((s, h) => s + (h.total_points ?? 0), 0)
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.streak_current), 0)

  const categories = groupByCategory(habits)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Streak</h1>
        <p className="text-sm text-gray-500">Chuỗi ngày không bỏ lỡ</p>
      </header>

      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Best Streak" value={`${maxStreak}🔥`} />
          <StatCard label="Tổng giờ" value={formatMinutes(totalMinutes)} />
          <StatCard label="Tổng XP" value={String(totalPoints)} />
        </div>

        {loading && <div className="text-center py-10 text-gray-400">Đang tải…</div>}

        <div className="space-y-6">
          {categories.map(({ categoryId, categoryName, categoryIcon, categoryColor, habits: catHabits }) => (
            <CategorySection
              key={categoryId}
              categoryName={categoryName}
              categoryIcon={categoryIcon}
              categoryColor={categoryColor}
              habits={catHabits}
              logMap={logMap}
              weekDays={weekDays}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function groupByCategory(habits: HabitStat[]) {
  const map = new Map<string, {
    categoryId: string
    categoryName: string
    categoryIcon: string
    categoryColor: string
    habits: HabitStat[]
  }>()

  for (const h of habits) {
    if (!map.has(h.category_id)) {
      map.set(h.category_id, {
        categoryId: h.category_id,
        categoryName: h.category_name,
        categoryIcon: h.category_icon,
        categoryColor: h.category_color,
        habits: [],
      })
    }
    map.get(h.category_id)!.habits.push(h)
  }

  return Array.from(map.values())
}

function CategorySection({
  categoryName,
  categoryIcon,
  categoryColor,
  habits,
  logMap,
  weekDays,
}: {
  categoryName: string
  categoryIcon: string
  categoryColor: string
  habits: HabitStat[]
  logMap: Map<string, Set<string>>
  weekDays: Date[]
}) {
  const bestStreak = habits.reduce((m, h) => Math.max(m, h.streak_current), 0)

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
          style={{ backgroundColor: categoryColor + '22', color: categoryColor }}
        >
          {categoryIcon}
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-gray-800 text-sm">{categoryName}</h2>
          <p className="text-xs text-gray-400">{habits.length} habit · best 🔥{bestStreak}</p>
        </div>
      </div>

      <div className="space-y-2">
        {habits.map(h => (
          <HabitStreakCard
            key={h.id}
            habit={h}
            accentColor={categoryColor}
            checkedDates={logMap.get(h.id) ?? new Set()}
            weekDays={weekDays}
          />
        ))}
      </div>
    </div>
  )
}

function HabitStreakCard({
  habit: h,
  accentColor,
  checkedDates,
  weekDays,
}: {
  habit: HabitStat
  accentColor: string
  checkedDates: Set<string>
  weekDays: Date[]
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{h.icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{h.name}</p>
          <p className="text-xs" style={{ color: accentColor }}>
            {h.total_logs ?? 0} lần · {formatMinutes(h.total_minutes ?? 0)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-base" style={{ color: accentColor }}>🔥 {h.streak_current}</p>
          <p className="text-xs text-gray-400">best {h.streak_best}</p>
        </div>
      </div>

      {/* Weekly calendar */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day, i) => {
          const dateStr = day.toISOString().slice(0, 10)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr
          const done = checkedDates.has(dateStr)

          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400 font-medium">{DAY_LABELS[i]}</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                style={
                  done
                    ? { backgroundColor: accentColor, color: '#fff' }
                    : isToday
                    ? { backgroundColor: 'transparent', border: `2px solid ${accentColor}`, color: accentColor }
                    : isFuture
                    ? { backgroundColor: '#f3f4f6', color: '#d1d5db' }
                    : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                }
              >
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Milestone bar */}
      <div className="flex gap-1.5">
        {[7, 14, 30, 100].map(m => (
          <div
            key={m}
            className="flex-1 rounded-lg py-1 text-center text-xs font-medium border transition-colors"
            style={
              h.streak_current >= m
                ? { backgroundColor: accentColor + '22', borderColor: accentColor + '55', color: accentColor }
                : { backgroundColor: '#f9fafb', borderColor: '#f3f4f6', color: '#d1d5db' }
            }
          >
            {m}d
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
