import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRewards } from '../hooks/useRewards'
import { PointsBadge } from '../components/PointsBadge'
import type { RewardProgress } from '../types/database'
import { formatPoints } from '../lib/utils'

export function RewardsPage() {
  const { rewards, loading, claimReward } = useRewards()
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleClaim(reward: RewardProgress) {
    const result = await claimReward(reward)
    if (result.error) showToast('Lỗi: ' + result.error)
    else showToast(`🎉 Đã đổi "${reward.name}"!`)
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
          <RewardCard key={r.id} reward={r} onClaim={handleClaim} />
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

      {toast && (
        <div className="fixed top-4 left-4 right-4 bg-gray-900 text-white text-sm rounded-xl px-4 py-3 z-50 text-center shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function RewardCard({ reward, onClaim }: { reward: RewardProgress; onClaim: (r: RewardProgress) => void }) {
  const canClaim = reward.available_points >= reward.points_required
  const pct = Math.min(100, reward.progress_pct ?? 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
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
          <span>{formatPoints(reward.available_points)} / {formatPoints(reward.points_required)} XP</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
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
        disabled={!canClaim}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          canClaim
            ? 'bg-violet-600 text-white active:bg-violet-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {canClaim ? '🎁 Đổi ngay' : `Còn thiếu ${formatPoints(reward.points_required - reward.available_points)} XP`}
      </button>
    </div>
  )
}
