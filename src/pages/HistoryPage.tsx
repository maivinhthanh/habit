import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHabits } from '../hooks/useHabits'
import { useDayLogs } from '../hooks/useDayLogs'
import { formatMinutes } from '../lib/utils'
import type { HabitStat } from '../types/database'
import type { HabitLog } from '../types/database'

const TODAY = new Date().toISOString().slice(0, 10)
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

// Monday of the week containing dateStr
function weekStart(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

function getWeek(anchorDate: string): string[] {
  const mon = weekStart(anchorDate)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

// ─── Week Strip ───────────────────────────────────────────────────────────────

function WeekStrip({
  selectedDate,
  onSelect,
  onPrevWeek,
  onNextWeek,
  logCountByDate,
}: {
  selectedDate: string
  onSelect: (d: string) => void
  onPrevWeek: () => void
  onNextWeek: () => void
  logCountByDate: Map<string, number>
}) {
  const week = getWeek(selectedDate)
  const selectedObj = new Date(selectedDate + 'T00:00:00')
  const monthLabel = selectedObj.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  const canGoNext = addDays(week[6], 1) <= TODAY

  return (
    <div className="bg-white px-4 pt-3 pb-4 border-b border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrevWeek}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100 text-gray-400"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-gray-800 capitalize">{monthLabel}</span>
        <button
          onClick={onNextWeek}
          disabled={!canGoNext}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100 text-gray-400 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {week.map((dateStr) => {
          const d = new Date(dateStr + 'T00:00:00')
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === TODAY
          const isFuture = dateStr > TODAY
          const hasLogs = (logCountByDate.get(dateStr) ?? 0) > 0

          return (
            <button
              key={dateStr}
              disabled={isFuture}
              onClick={() => onSelect(dateStr)}
              className="flex flex-col items-center gap-1 disabled:opacity-30"
            >
              <span className={`text-[10px] font-semibold ${isSelected ? 'text-orange-500' : 'text-gray-400'}`}>
                {DAY_LABELS[d.getDay()]}
              </span>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                  : isToday
                  ? 'border-2 border-orange-300 text-orange-500'
                  : 'text-gray-600'
              }`}>
                {d.getDate()}
              </div>
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                hasLogs && !isFuture ? 'bg-orange-400' : 'bg-transparent'
              }`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Habit Row (read-only) ────────────────────────────────────────────────────

function HistoryHabitRow({ habit, log }: { habit: HabitStat; log: HabitLog | undefined }) {
  const done = !!log
  const rowBg = habit.category_color + '18'

  return (
    <div
      className="rounded-2xl overflow-hidden transition-opacity"
      style={{ backgroundColor: done ? rowBg : '#f9fafb', opacity: done ? 1 : 0.55 }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ backgroundColor: done ? habit.category_color : '#d1d5db' }}
        >
          {habit.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-[15px] leading-snug">{habit.name}</p>
          {done ? (
            <p className="text-xs text-green-500 mt-0.5">
              Hoàn thành · {formatMinutes(log.duration_minutes)}
              {log.streak_at > 0 && <span className="ml-1.5 text-orange-400">🔥{log.streak_at}</span>}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">Chưa thực hiện</p>
          )}
          {done && log.note && (
            <p className="text-xs text-gray-400 mt-0.5 italic">"{log.note}"</p>
          )}
        </div>

        <div className="flex-shrink-0 text-right">
          {done ? (
            <div className="flex flex-col items-end gap-0.5">
              <div className="w-8 h-8 rounded-full border-2 border-green-400 flex items-center justify-center">
                <span className="text-green-400 text-sm font-bold leading-none">✓</span>
              </div>
              <span className="text-[10px] text-orange-400 font-medium">+{log.points_earned} XP</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center">
              <span className="text-gray-300 text-sm leading-none">✕</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HistoryPage() {
  const { date: paramDate } = useParams<{ date?: string }>()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(paramDate ?? addDays(TODAY, -1))

  const { habits, loading: habitsLoading } = useHabits()
  const { logByHabit, logs, loading: logsLoading } = useDayLogs(selectedDate)

  const logCountByDate = new Map<string, number>()
  if (logs.length > 0) logCountByDate.set(selectedDate, logs.length)

  function prevWeek() {
    setSelectedDate(d => addDays(weekStart(d), -7))
  }
  function nextWeek() {
    const next = addDays(weekStart(selectedDate), 7)
    if (next <= TODAY) setSelectedDate(next)
  }

  const selectedObj = new Date(selectedDate + 'T00:00:00')
  const dateLabel = selectedObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
  const isToday = selectedDate === TODAY

  const done = habits.filter(h => logByHabit.has(h.id))
  const missed = habits.filter(h => !logByHabit.has(h.id))
  const totalXP = logs.reduce((s, l) => s + l.points_earned, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl active:bg-gray-100 text-gray-500 text-xl leading-none"
        >
          ←
        </button>
        <div>
          <p className="text-xs text-gray-400 capitalize">{dateLabel}</p>
          <h1 className="text-xl font-bold text-gray-900">{isToday ? 'Hôm nay' : 'Lịch sử'}</h1>
        </div>
      </header>

      <WeekStrip
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        onPrevWeek={prevWeek}
        onNextWeek={nextWeek}
        logCountByDate={logCountByDate}
      />

      {/* Summary bar */}
      {!logsLoading && habits.length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{done.length}</p>
            <p className="text-[10px] text-gray-400">Hoàn thành</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-lg font-bold text-gray-400">{missed.length}</p>
            <p className="text-[10px] text-gray-400">Bỏ lỡ</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-lg font-bold text-orange-500">{totalXP}</p>
            <p className="text-[10px] text-gray-400">XP kiếm được</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {habits.length > 0 ? Math.round((done.length / habits.length) * 100) : 0}%
            </p>
            <p className="text-[10px] text-gray-400">Tỉ lệ</p>
          </div>
        </div>
      )}

      <div className="px-3 py-3 space-y-2">
        {(habitsLoading || logsLoading) && (
          <div className="text-center py-10 text-gray-300 text-sm">Đang tải…</div>
        )}

        {!habitsLoading && !logsLoading && (
          <>
            {done.map(h => (
              <HistoryHabitRow key={h.id} habit={h} log={logByHabit.get(h.id)} />
            ))}
            {missed.length > 0 && (
              <>
                {done.length > 0 && (
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-1 pt-1">
                    Chưa thực hiện
                  </p>
                )}
                {missed.map(h => (
                  <HistoryHabitRow key={h.id} habit={h} log={undefined} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
