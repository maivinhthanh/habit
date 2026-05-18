import { useHabits } from '../hooks/useHabits'
import { formatMinutes } from '../lib/utils'

export function StreakPage() {
  const { habits, loading } = useHabits()

  const totalMinutes = habits.reduce((s, h) => s + (h.total_minutes ?? 0), 0)
  const totalPoints = habits.reduce((s, h) => s + (h.total_points ?? 0), 0)
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.streak_best), 0)

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

        <div className="space-y-3">
          {habits.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{h.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{h.name}</p>
                  <p className="text-xs text-gray-500">{h.category_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-500 font-bold text-lg">🔥 {h.streak_current}</p>
                  <p className="text-xs text-gray-400">best {h.streak_best}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-xs text-gray-400">Logs</p>
                  <p className="font-semibold text-gray-700">{h.total_logs ?? 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-xs text-gray-400">Tổng giờ</p>
                  <p className="font-semibold text-gray-700">{formatMinutes(h.total_minutes ?? 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-xs text-gray-400">XP</p>
                  <p className="font-semibold text-gray-700">{h.total_points ?? 0}</p>
                </div>
              </div>

              <StreakMilestones streak={h.streak_current} />
            </div>
          ))}
        </div>
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

function StreakMilestones({ streak }: { streak: number }) {
  const milestones = [7, 14, 30, 100]
  return (
    <div className="mt-3 flex gap-2">
      {milestones.map(m => (
        <div
          key={m}
          className={`flex-1 rounded-lg py-1.5 text-center text-xs font-medium border ${
            streak >= m
              ? 'bg-orange-100 border-orange-200 text-orange-600'
              : 'bg-gray-50 border-gray-100 text-gray-300'
          }`}
        >
          {m}d
        </div>
      ))}
    </div>
  )
}
