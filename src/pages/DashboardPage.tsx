import { useState, useEffect } from 'react'
import { usePoints } from '../hooks/usePoints'
import { useHabits } from '../hooks/useHabits'
import { supabase } from '../lib/supabase'
import { formatPoints } from '../lib/utils'
import type { HabitLog } from '../types/database'

interface DayPoint { day: string; points: number }

export function DashboardPage() {
  const { points } = usePoints()
  const { habits } = useHabits()
  const [weekData, setWeekData] = useState<DayPoint[]>([])

  useEffect(() => {
    loadWeekData()
  }, [])

  async function loadWeekData() {
    const days: DayPoint[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({ day: d.toISOString().slice(0, 10), points: 0 })
    }

    const start = days[0].day
    const { data } = await supabase
      .from('habit_logs')
      .select('checked_at, points_earned')
      .gte('checked_at', start)

    const logs = (data ?? []) as Pick<HabitLog, 'checked_at' | 'points_earned'>[]
    for (const log of logs) {
      const d = log.checked_at.slice(0, 10)
      const entry = days.find(x => x.day === d)
      if (entry) entry.points += log.points_earned
    }

    setWeekData(days)
  }

  const maxPoints = Math.max(...weekData.map(d => d.points), 1)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const totalStreak = habits.reduce((s, h) => s + h.streak_current, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Thống kê của bạn</p>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon="⚡"
            label="Khả dụng"
            value={formatPoints(points?.available_points ?? 0)}
            color="text-amber-500"
          />
          <StatCard
            icon="📈"
            label="Tổng kiếm"
            value={formatPoints(points?.total_earned ?? 0)}
            color="text-green-500"
          />
          <StatCard
            icon="💸"
            label="Đã tiêu"
            value={formatPoints(points?.total_spent ?? 0)}
            color="text-red-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="🔥" label="Tổng streak" value={String(totalStreak)} color="text-orange-500" />
          <StatCard icon="✅" label="Habits" value={String(habits.length)} color="text-violet-500" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="font-semibold text-gray-700 mb-4">XP 7 ngày qua</p>
          <div className="flex items-end gap-1.5 h-32">
            {weekData.map((d, i) => {
              const h = maxPoints > 0 ? (d.points / maxPoints) * 100 : 0
              const date = new Date(d.day + 'T12:00:00')
              const isToday = d.day === new Date().toISOString().slice(0, 10)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: '96px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all ${isToday ? 'bg-violet-500' : 'bg-violet-200'}`}
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{dayLabels[date.getDay()]}</span>
                  {d.points > 0 && (
                    <span className="text-xs font-medium text-gray-600">{d.points}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, color,
}: {
  icon: string; label: string; value: string; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
      <span className="text-xl">{icon}</span>
      <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
