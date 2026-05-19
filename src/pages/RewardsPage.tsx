import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useRewards } from '../hooks/useRewards'
import { usePoints } from '../hooks/usePoints'
import { PointsBadge } from '../components/PointsBadge'
import type { RewardProgress } from '../types/database'
import { formatPoints } from '../lib/utils'

const ICONS = ['🎮', '👟', '🍕', '✈️', '🎬', '📱', '🎁', '🛍️', '🎉', '🏖️', '🍣', '☕', '📖', '🎵', '💆', '🏆']
const REVEAL_WIDTH = 144
const SWIPE_THRESHOLD = 50

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditRewardModal({
  reward,
  onClose,
  onSave,
}: {
  reward: RewardProgress
  onClose: () => void
  onSave: (updates: { name: string; description: string | null; icon: string; points_required: number; target_date: string | null }) => Promise<void>
}) {
  const [name, setName] = useState(reward.name)
  const [description, setDescription] = useState(reward.description ?? '')
  const [icon, setIcon] = useState(reward.icon)
  const [points, setPoints] = useState(reward.points_required)
  const [targetDate, setTargetDate] = useState(reward.target_date ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setLoading(true)
    await onSave({
      name: name.trim(),
      description: description.trim() || null,
      icon,
      points_required: points,
      target_date: targetDate || null,
    })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-[200]" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Sửa phần thưởng</h2>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">✕</button>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Tên</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="input"
            placeholder="Tên phần thưởng"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Mô tả (tuỳ chọn)</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="input"
            placeholder="Chi tiết về phần thưởng"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Icon</label>
          <div className="grid grid-cols-8 gap-2">
            {ICONS.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`text-2xl h-10 rounded-xl flex items-center justify-center transition-all ${
                  icon === i ? 'bg-violet-100 ring-2 ring-violet-500' : 'bg-gray-50 border border-gray-100'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">XP cần thiết: {points.toLocaleString()}</label>
          <input
            type="range" min={50} max={5000} step={50} value={points}
            onChange={e => setPoints(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>50</span><span>5,000</span>
          </div>
          <input
            type="number" value={points}
            onChange={e => setPoints(Math.max(1, Number(e.target.value)))}
            className="input text-center font-semibold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Deadline (tuỳ chọn)</label>
          <input
            type="date" value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            className="input"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !name.trim()}
          className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
        >
          {loading ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>
    </div>
  )
}

// ─── Reward Card with swipe ───────────────────────────────────────────────────

function RewardCard({
  reward,
  availablePoints,
  onClaim,
  onEdit,
  onDelete,
  isClaiming,
}: {
  reward: RewardProgress
  availablePoints: number
  onClaim: (r: RewardProgress) => void
  onEdit: () => void
  onDelete: () => void
  isClaiming: boolean
}) {
  const canClaim = availablePoints >= reward.points_required
  const pct = Math.min(100, (availablePoints / reward.points_required) * 100)

  const [offset, setOffset] = useState(0)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const isDragging = useRef(false)

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    startOffset.current = offset
    isDragging.current = false
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current
    if (Math.abs(dx) > 5) isDragging.current = true
    // swipe left (dx < 0) to reveal buttons on right
    const next = Math.max(-REVEAL_WIDTH, Math.min(0, startOffset.current + dx))
    setOffset(next)
  }

  function onTouchEnd() {
    if (offset < -SWIPE_THRESHOLD) {
      setOffset(-REVEAL_WIDTH)
    } else {
      setOffset(0)
    }
  }

  function closeSwipe() {
    setOffset(0)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Action buttons — revealed on right when card slides left */}
      <div
        className="absolute right-0 inset-y-0 flex rounded-r-2xl overflow-hidden"
        style={{ width: REVEAL_WIDTH }}
      >
        <button
          onClick={() => { closeSwipe(); onEdit() }}
          className="flex-1 bg-violet-500 active:bg-violet-600 text-white flex flex-col items-center justify-center gap-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
          </svg>
          <span className="text-xs font-semibold">Sửa</span>
        </button>
        <button
          onClick={() => { closeSwipe(); onDelete() }}
          className="flex-1 bg-red-500 active:bg-red-600 text-white flex flex-col items-center justify-center gap-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
          <span className="text-xs font-semibold">Xoá</span>
        </button>
      </div>

      {/* Card */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={offset > 0 ? closeSwipe : undefined}
        className={`space-y-3 p-4 rounded-2xl ${
          canClaim
            ? 'bg-violet-50 border-2 border-violet-400 shadow-md shadow-violet-100'
            : 'bg-white border border-gray-100 shadow-sm'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">{reward.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{reward.name}</p>
            {reward.description && <p className="text-xs text-gray-500 mt-0.5">{reward.description}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-violet-600">{formatPoints(reward.points_required)} XP</p>
            {reward.target_date && (
              <p className="text-xs text-gray-400">
                {reward.days_remaining != null && reward.days_remaining >= 0
                  ? `${reward.days_remaining} ngày`
                  : 'Hết hạn'}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{formatPoints(availablePoints)} / {formatPoints(reward.points_required)} XP</span>
            <span className={canClaim ? 'text-violet-600 font-semibold' : ''}>{Math.round(pct)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-violet-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {reward.xp_per_day_needed != null && reward.xp_per_day_needed > 0 && !canClaim && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            Cần earn {Math.ceil(reward.xp_per_day_needed)} XP/ngày để đạt deadline
          </p>
        )}

        <button
          onClick={() => onClaim(reward)}
          disabled={!canClaim || isClaiming}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            canClaim && !isClaiming
              ? 'bg-violet-600 text-white active:bg-violet-700 shadow-sm shadow-violet-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isClaiming ? 'Đang xử lý…' : canClaim ? '🎁 Đổi ngay' : `Còn thiếu ${formatPoints(reward.points_required - availablePoints)} XP`}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RewardsPage() {
  const { rewards, loading, claimReward, deleteReward, updateReward } = useRewards()
  const { points, refetch: refetchPoints } = usePoints()
  const [toast, setToast] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<RewardProgress | null>(null)
  const [editing, setEditing] = useState<RewardProgress | null>(null)
  const [claiming, setClaiming] = useState<string | null>(null)
  const availablePoints = points?.available_points ?? 0

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleClaim(reward: RewardProgress) {
    if (claiming) return
    setClaiming(reward.id)
    const result = await claimReward(reward)
    await refetchPoints()
    setClaiming(null)
    if (result.error) showToast('Lỗi: ' + result.error)
    else showToast(`🎉 Đã đổi "${reward.name}"!`)
  }

  async function handleDelete() {
    if (!confirmDelete) return
    const err = await deleteReward(confirmDelete.id)
    setConfirmDelete(null)
    if (err) showToast('Lỗi: ' + err.message)
    else showToast(`Đã xoá "${confirmDelete.name}"`)
  }

  async function handleEdit(updates: {
    name: string; description: string | null; icon: string; points_required: number; target_date: string | null
  }) {
    if (!editing) return
    const err = await updateReward(editing.id, updates)
    setEditing(null)
    if (err) showToast('Lỗi: ' + err.message)
    else showToast('Đã cập nhật phần thưởng')
  }

  const active = rewards.filter(r => !r.is_claimed)
  const claimed = rewards.filter(r => r.is_claimed)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Phần thưởng</h1>
          <p className="text-sm text-gray-500">{active.length} mục tiêu đang chờ</p>
        </div>
        <PointsBadge />
      </header>

      <div className="px-4 py-4 space-y-3">
        <Link
          to="/rewards/new"
          className="flex items-center justify-center gap-2 border-2 border-dashed border-violet-200 rounded-2xl py-3 text-violet-500 text-sm font-medium"
        >
          + Thêm phần thưởng
        </Link>

        {loading && <div className="text-center py-10 text-gray-400">Đang tải…</div>}

        {active.map(r => (
          <RewardCard
            key={r.id}
            reward={r}
            availablePoints={availablePoints}
            onClaim={handleClaim}
            onEdit={() => setEditing(r)}
            onDelete={() => setConfirmDelete(r)}
            isClaiming={claiming === r.id}
          />
        ))}

        {claimed.length > 0 && (
          <>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-2">Đã đổi</p>
            {claimed.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{r.icon}</span>
                  <p className="font-semibold text-gray-700 flex-1">{r.name}</p>
                  <span className="text-green-500 text-lg">✓</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {editing && (
        <EditRewardModal
          reward={editing}
          onClose={() => setEditing(null)}
          onSave={handleEdit}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-[200]" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-t-2xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{confirmDelete.icon}</span>
              <div>
                <p className="font-bold text-gray-900">Xoá phần thưởng?</p>
                <p className="text-sm text-gray-500">{confirmDelete.name}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm active:bg-red-600"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 left-4 right-4 bg-gray-900 text-white text-sm rounded-xl px-4 py-3 z-50 text-center shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
