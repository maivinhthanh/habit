import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRewards } from '../hooks/useRewards'

const ICONS = ['🎮', '👟', '🍕', '✈️', '🎬', '📱', '🎁', '🛍️', '🎉', '🏖️', '🍣', '☕', '📖', '🎵', '💆', '🏆']

export function AddRewardPage() {
  const navigate = useNavigate()
  const { addReward } = useRewards()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [points, setPoints] = useState(500)
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Nhập tên phần thưởng')
    if (points < 1) return setError('XP phải lớn hơn 0')
    setLoading(true)
    setError('')
    const err = await addReward({
      name: name.trim(),
      description: description.trim() || null,
      icon,
      points_required: points,
      target_date: targetDate || null,
    })
    setLoading(false)
    if (err) setError(`${err.message}${err.details ? ' — ' + err.details : ''}${err.hint ? ' (' + err.hint + ')' : ''}`)
    else navigate('/rewards')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-gray-900">Thêm phần thưởng</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
        <Field label="Tên phần thưởng">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ví dụ: Mua giày mới"
            className="input"
          />
        </Field>

        <Field label="Mô tả (tuỳ chọn)">
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Chi tiết về phần thưởng"
            className="input"
          />
        </Field>

        <Field label="Icon">
          <div className="grid grid-cols-8 gap-2">
            {ICONS.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`text-2xl h-10 rounded-xl flex items-center justify-center transition-all ${
                  icon === i ? 'bg-violet-100 ring-2 ring-violet-500' : 'bg-white border border-gray-100'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`XP cần thiết: ${points.toLocaleString()}`}>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={points}
            onChange={e => setPoints(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>50</span><span>5,000</span>
          </div>
          <input
            type="number"
            value={points}
            onChange={e => setPoints(Math.max(1, Number(e.target.value)))}
            className="input mt-2 text-center font-semibold"
          />
        </Field>

        <Field label="Deadline (tuỳ chọn)">
          <input
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            className="input"
          />
        </Field>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
        >
          {loading ? 'Đang lưu…' : 'Tạo phần thưởng'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}
