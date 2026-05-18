import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHabits } from '../hooks/useHabits'
import { PointsBadge } from '../components/PointsBadge'
import type { HabitStat } from '../types/database'
import { formatMinutes, isMilestone, streakBonus } from '../lib/utils'

function CheckInModal({
  habit,
  onClose,
  onConfirm,
}: {
  habit: HabitStat
  onClose: () => void
  onConfirm: (minutes: number, note: string) => Promise<void>
}) {
  const [minutes, setMinutes] = useState(habit.duration_minutes)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const points = habit.points_per_minute * minutes
  const nextStreak = habit.streak_current + 1
  const bonus = isMilestone(nextStreak) ? streakBonus(nextStreak) : 0

  async function handleConfirm() {
    setLoading(true)
    await onConfirm(minutes, note)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full p-6 pb-safe space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.icon}</span>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{habit.name}</h2>
            <p className="text-sm text-gray-500">{habit.category_name} · {habit.points_per_minute} XP/min</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Thời gian thực tế</span>
            <span className="font-semibold text-violet-600">{formatMinutes(minutes)}</span>
          </div>
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5m</span><span>3h</span>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-amber-700">Điểm nhận được</span>
          <div className="text-right">
            <span className="font-bold text-amber-600 text-lg">+{points} XP</span>
            {bonus > 0 && (
              <p className="text-xs text-amber-500">+{bonus} XP milestone streak {nextStreak}🔥</p>
            )}
          </div>
        </div>

        <textarea
          placeholder="Ghi chú (tuỳ chọn)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
        />

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold text-base disabled:opacity-60 active:bg-violet-700 transition-colors"
        >
          {loading ? 'Đang lưu…' : `Check-in ✓`}
        </button>
      </div>
    </div>
  )
}

function HabitCard({ habit, onCheckIn }: { habit: HabitStat; onCheckIn: (h: HabitStat) => void }) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
        habit.checked_today
          ? 'bg-green-50 border-green-200 opacity-70'
          : 'bg-white border-gray-100 shadow-sm active:scale-98'
      }`}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: habit.category_color + '20' }}
      >
        {habit.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{habit.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{habit.category_name}</span>
          {habit.streak_current > 0 && (
            <span className="text-xs text-orange-500 font-medium">🔥 {habit.streak_current}</span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-xs text-gray-400">{habit.points_per_minute} XP/min</p>
        {habit.checked_today ? (
          <span className="text-green-500 text-lg">✓</span>
        ) : (
          <button
            onClick={() => onCheckIn(habit)}
            className="mt-1 bg-violet-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium active:bg-violet-700 transition-colors"
          >
            Check
          </button>
        )}
      </div>
    </div>
  )
}

export function TodayPage() {
  const { habits, loading, checkIn } = useHabits()
  const [selected, setSelected] = useState<HabitStat | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const pending = habits.filter(h => !h.checked_today)
  const done = habits.filter(h => h.checked_today)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleConfirm(minutes: number, note: string) {
    if (!selected) return
    const result = await checkIn(selected, minutes, note)
    setSelected(null)
    if (result.error) {
      showToast('Lỗi: ' + result.error)
    } else {
      const msg = result.bonus
        ? `+${result.points} XP 🎉 Milestone ${result.streak}🔥 +${result.bonus} bonus!`
        : `+${result.points} XP · Streak ${result.streak}🔥`
      showToast(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hôm nay</h1>
          <p className="text-sm text-gray-500">{done.length}/{habits.length} hoàn thành</p>
        </div>
        <PointsBadge />
      </header>

      <div className="px-4 py-4 space-y-3">
        {loading && (
          <div className="text-center py-10 text-gray-400">Đang tải…</div>
        )}

        {!loading && habits.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🌱</p>
            <p className="text-gray-500">Chưa có habit nào</p>
            <Link
              to="/habits/new"
              className="inline-block bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-medium"
            >
              Thêm habit đầu tiên
            </Link>
          </div>
        )}

        {pending.map(h => (
          <HabitCard key={h.id} habit={h} onCheckIn={setSelected} />
        ))}

        {done.length > 0 && (
          <>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-2">Đã xong</p>
            {done.map(h => (
              <HabitCard key={h.id} habit={h} onCheckIn={setSelected} />
            ))}
          </>
        )}
      </div>

      {selected && (
        <CheckInModal
          habit={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleConfirm}
        />
      )}

      {toast && (
        <div className="fixed top-4 left-4 right-4 bg-gray-900 text-white text-sm rounded-xl px-4 py-3 z-50 text-center shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
