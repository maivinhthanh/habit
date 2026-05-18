import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'

const ICONS = ['🏃', '📚', '🧘', '💪', '🎨', '🎵', '🧹', '🍎', '💧', '😴', '🌿', '✍️', '🚴', '🏊', '🧠', '🙏']
const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#0ea5e9', '#64748b',
]

export function AddCategoryPage() {
  const navigate = useNavigate()
  const { addCategory } = useCategories()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [color, setColor] = useState(COLORS[0])
  const [ppm, setPpm] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Nhập tên danh mục')
    setLoading(true)
    setError('')
    const err = await addCategory({ name: name.trim(), icon, color, points_per_minute: ppm })
    setLoading(false)
    if (err) setError(err.message)
    else navigate('/settings')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-gray-900">Thêm danh mục</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
        <Field label="Tên danh mục">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ví dụ: Thể thao"
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

        <Field label="Màu sắc">
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </Field>

        <Field label={`Điểm/phút: ${ppm} XP`}>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={ppm}
            onChange={e => setPpm(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 XP/min</span><span>20 XP/min</span>
          </div>
          <p className="text-sm text-amber-600 mt-1">
            30 phút × {ppm} XP = {30 * ppm} XP / lần check-in
          </p>
        </Field>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: color + '20' }}
          >
            {icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{name || 'Tên danh mục'}</p>
            <p className="text-xs text-gray-400">{ppm} XP/phút</p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
        >
          {loading ? 'Đang lưu…' : 'Tạo danh mục'}
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
