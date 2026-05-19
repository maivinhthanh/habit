import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useHabits } from '../hooks/useHabits'
import { useCategories } from '../hooks/useCategories'
import { PointsBadge } from '../components/PointsBadge'
import { SwipeableRow } from '../components/SwipeableRow'
import type { HabitStat, Category } from '../types/database'
import { formatMinutes, isMilestone, streakBonus } from '../lib/utils'

const HABIT_ICONS = ['🏃', '📚', '🧘', '💪', '🎨', '🎵', '🧹', '🍎', '💧', '😴', '🌿', '✍️', '🚴', '🏊', '🧠', '🙏']

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buổi sáng'
  if (h < 18) return 'Buổi chiều'
  return 'Buổi tối'
}

// ─── Week Calendar ────────────────────────────────────────────────────────────

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function WeekCalendar({ habits }: { habits: HabitStat[] }) {
  const navigate = useNavigate()
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const dow = now.getDay()
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - dow + i)
    return d
  })

  const monthLabel = now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  const doneCount = habits.filter(h => h.checked_today).length
  const total = habits.length

  return (
    <div className="bg-white px-5 pt-3 pb-4 border-b border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-800 capitalize">{monthLabel}</span>
        <span className="text-xs text-gray-400">{doneCount}/{total} hoàn thành</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, i) => {
          const dateStr = date.toISOString().slice(0, 10)
          const isToday = dateStr === todayStr
          const isPast = dateStr < todayStr
          return (
            <button
              key={i}
              disabled={!isPast}
              onClick={() => navigate(`/history/${dateStr}`)}
              className="flex flex-col items-center gap-1 disabled:cursor-default"
            >
              <span className={`text-[10px] font-semibold ${isToday ? 'text-orange-500' : 'text-gray-400'}`}>
                {DAY_LABELS[i]}
              </span>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                isToday
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                  : isPast
                  ? 'text-gray-600 active:bg-gray-100'
                  : 'text-gray-300'
              }`}>
                {date.getDate()}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Check-in Modal ───────────────────────────────────────────────────────────

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
    <div className="fixed inset-0 bg-black/50 flex items-end z-[200]" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full p-6 pb-safe space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: habit.category_color }}
          >
            {habit.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{habit.name}</h2>
            <p className="text-sm text-gray-400">{habit.category_name} · {habit.points_per_minute} XP/min</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Thời gian thực tế</span>
            <span className="font-bold text-orange-500">{formatMinutes(minutes)}</span>
          </div>
          <input
            type="range" min={5} max={180} step={5} value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>5m</span><span>3h</span>
          </div>
        </div>

        <div className="bg-orange-50 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-sm text-orange-700">Điểm nhận được</span>
          <div className="text-right">
            <span className="font-bold text-orange-500 text-lg">+{points} XP</span>
            {bonus > 0 && (
              <p className="text-xs text-orange-400">+{bonus} XP milestone streak {nextStreak}🔥</p>
            )}
          </div>
        </div>

        <textarea
          placeholder="Ghi chú (tuỳ chọn)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
        />

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-orange-500 text-white rounded-2xl py-3.5 font-bold text-base disabled:opacity-60 active:bg-orange-600 transition-colors"
        >
          {loading ? 'Đang lưu…' : 'Hoàn thành ✓'}
        </button>
      </div>
    </div>
  )
}

// ─── Edit Habit Modal ─────────────────────────────────────────────────────────

function EditHabitModal({
  habit,
  categories,
  onClose,
  onSave,
}: {
  habit: HabitStat
  categories: Category[]
  onClose: () => void
  onSave: (updates: { name: string; icon: string; category_id: string; duration_minutes: number }) => Promise<void>
}) {
  const [name, setName] = useState(habit.name)
  const [icon, setIcon] = useState(habit.icon)
  const [categoryId, setCategoryId] = useState(habit.category_id)
  const [duration, setDuration] = useState(habit.duration_minutes)
  const [loading, setLoading] = useState(false)

  const selectedCategory = categories.find(c => c.id === categoryId)

  async function handleSave() {
    if (!name.trim() || !categoryId) return
    setLoading(true)
    await onSave({ name: name.trim(), icon, category_id: categoryId, duration_minutes: duration })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-[200]" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Sửa habit</h2>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">✕</button>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Tên</label>
          <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Tên habit" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Icon</label>
          <div className="grid grid-cols-8 gap-2">
            {HABIT_ICONS.map(i => (
              <button key={i} type="button" onClick={() => setIcon(i)}
                className={`text-2xl h-10 rounded-xl flex items-center justify-center transition-all ${
                  icon === i ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-gray-50 border border-gray-100'
                }`}
              >{i}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Danh mục</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(c => (
              <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  categoryId === c.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span className="text-xl">{c.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.points_per_minute} XP/min</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Thời gian mặc định: {duration} phút</label>
          <input type="range" min={5} max={120} step={5} value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-400"><span>5m</span><span>2h</span></div>
          {selectedCategory && (
            <p className="text-sm text-amber-600">≈ {selectedCategory.points_per_minute * duration} XP / lần check-in</p>
          )}
        </div>

        <button onClick={handleSave} disabled={loading || !name.trim() || !categoryId}
          className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
        >
          {loading ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>
    </div>
  )
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────

function ConfirmDeleteDialog({
  title,
  description,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-[200]" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div>
          <p className="font-bold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        <p className="text-sm text-gray-400">Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm"
          >Huỷ</button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm active:bg-red-600"
          >Xoá</button>
        </div>
      </div>
    </div>
  )
}

// ─── Habit Row ────────────────────────────────────────────────────────────────

function HabitRow({
  habit,
  onCheckIn,
  onEdit,
  onDelete,
}: {
  habit: HabitStat
  onCheckIn: (h: HabitStat) => void
  onEdit: (h: HabitStat) => void
  onDelete: (h: HabitStat) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const letter = habit.name.charAt(0).toUpperCase()
  const rowBg = habit.category_color + '18'

  const statusText = habit.checked_today
    ? `Hoàn thành · ${formatMinutes(habit.duration_minutes)}`
    : `Mục tiêu: ${formatMinutes(habit.duration_minutes)}`

  return (
    <SwipeableRow onEdit={() => onEdit(habit)} onDelete={() => onDelete(habit)}>
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: rowBg }}>
      {/* Main row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Letter avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ backgroundColor: habit.category_color }}
        >
          {letter}
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-[15px] leading-snug">{habit.name}</p>
          <p className={`text-xs mt-0.5 ${habit.checked_today ? 'text-green-500' : 'text-gray-400'}`}>
            {statusText}
            {!habit.checked_today && habit.streak_current > 0 && (
              <span className="ml-1.5 text-orange-400">🔥{habit.streak_current}</span>
            )}
          </p>
        </div>

        {/* Action button */}
        {habit.checked_today ? (
          <div className="w-9 h-9 rounded-full border-2 border-green-400 flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 text-sm font-bold leading-none">✓</span>
          </div>
        ) : (
          <div
            role="button"
            onClick={e => { e.stopPropagation(); onCheckIn(habit) }}
            className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 active:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
          >
            <span className="text-white text-sm leading-none ml-0.5">▶</span>
          </div>
        )}
      </button>

      {/* Expanded stats */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/40">
          <div className="grid grid-cols-3 gap-2 pt-3">
            <div className="bg-white/60 rounded-xl py-2.5 text-center">
              <p className="text-sm font-bold text-gray-800">{habit.streak_current}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Streak</p>
            </div>
            <div className="bg-white/60 rounded-xl py-2.5 text-center">
              <p className="text-sm font-bold text-gray-800">{habit.total_logs}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Sessions</p>
            </div>
            <div className="bg-white/60 rounded-xl py-2.5 text-center">
              <p className="text-sm font-bold text-orange-500">{habit.total_points}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">XP tổng</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 px-0.5">
            <span>Best: <span className="font-semibold text-gray-600">{habit.streak_best}</span></span>
            <span>Tổng: <span className="font-semibold text-gray-600">{formatMinutes(habit.total_minutes)}</span></span>
          </div>
          {!habit.checked_today && (
            <button
              onClick={() => onCheckIn(habit)}
              className="w-full bg-orange-500 text-white rounded-xl py-2.5 text-sm font-bold active:bg-orange-600 transition-colors"
            >
              Bắt đầu ▶
            </button>
          )}
        </div>
      )}
    </div>
    </SwipeableRow>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TodayPage() {
  const { habits, loading, checkIn, updateHabit, deleteHabit } = useHabits()
  const { categories } = useCategories()
  const [selected, setSelected] = useState<HabitStat | null>(null)
  const [editingHabit, setEditingHabit] = useState<HabitStat | null>(null)
  const [deletingHabit, setDeletingHabit] = useState<HabitStat | null>(null)
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

  async function handleEditSave(updates: { name: string; icon: string; category_id: string; duration_minutes: number }) {
    if (!editingHabit) return
    const err = await updateHabit(editingHabit.id, updates)
    setEditingHabit(null)
    if (err) showToast('Lỗi: ' + err.message)
    else showToast('Đã cập nhật habit')
  }

  async function handleDeleteConfirm() {
    if (!deletingHabit) return
    const name = deletingHabit.name
    const err = await deleteHabit(deletingHabit.id)
    setDeletingHabit(null)
    if (err) showToast('Lỗi: ' + err.message)
    else showToast(`Đã xoá "${name}"`)
  }

  const dateLabel = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 capitalize">{greeting()} · {dateLabel}</p>
          <h1 className="text-xl font-bold text-gray-900">Hôm nay</h1>
        </div>
        <PointsBadge />
      </header>
      <WeekCalendar habits={habits} />

      <div className="px-3 py-3 space-y-2">
        {loading && (
          <div className="text-center py-10 text-gray-300 text-sm">Đang tải…</div>
        )}

        {!loading && habits.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <p className="text-5xl">🌱</p>
            <p className="text-gray-400 text-sm">Chưa có habit nào</p>
            <Link
              to="/habits/new"
              className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-2xl text-sm font-bold"
            >
              Thêm habit đầu tiên
            </Link>
          </div>
        )}

        {pending.map(h => (
          <HabitRow key={h.id} habit={h} onCheckIn={setSelected} onEdit={setEditingHabit} onDelete={setDeletingHabit} />
        ))}

        {done.length > 0 && (
          <>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-1 pt-1">
              Đã xong
            </p>
            {done.map(h => (
              <HabitRow key={h.id} habit={h} onCheckIn={setSelected} onEdit={setEditingHabit} onDelete={setDeletingHabit} />
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

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          categories={categories}
          onClose={() => setEditingHabit(null)}
          onSave={handleEditSave}
        />
      )}

      {deletingHabit && (
        <ConfirmDeleteDialog
          title={`Xoá "${deletingHabit.name}"?`}
          description="Habit sẽ bị ẩn khỏi danh sách."
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingHabit(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-4 right-4 bg-gray-900 text-white text-sm rounded-2xl px-4 py-3 z-50 text-center shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
