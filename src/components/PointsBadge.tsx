import { usePoints } from '../hooks/usePoints'
import { formatPoints } from '../lib/utils'

export function PointsBadge() {
  const { points } = usePoints()
  return (
    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
      <span>⚡</span>
      <span>{points ? formatPoints(points.available_points) : '—'} XP</span>
    </div>
  )
}
