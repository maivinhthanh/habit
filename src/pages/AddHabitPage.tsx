import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabits } from '../hooks/useHabits'
import { useCategories } from '../hooks/useCategories'

const ICONS = ['🏃', '📚', '🧘', '💪', '🎨', '🎵', '🧹', '🍎', '💧', '😴', '🌿', '✍️', '🚴', '🏊', '🧠', '🙏']

export function AddHabitPage() {
  const navigate = useNavigate()
  const { addHabit } = useHabits()
  const { categories } = useCategories()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [categoryId, setCategoryId] = useState('')
  const [duration, setDuration] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedCategory = categories.find(c => c.id === categoryId)
  const estimatedPoints = selectedCategory ? selectedCategory.points_per_minute * duration : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Nhập tên habit')
    if (!categoryId) return setError('Chọn danh mục')
    setLoading(true)
    setError('')
    const err = await addHabit({ name: name.trim(), icon, category_id: categoryId, duration_minutes: duration })
    setLoading(false)
    if (err) setError(err.message)
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-gray-900">Thêm habit</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
        <Field label="Tên habit">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ví dụ: Đọc sách"
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

        <Field label="Danh mục">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">
              Chưa có danh mục —{' '}
              <button type="button" onClick={() => navigate('/categories/new')} className="text-violet-600">
                tạo mới
              </button>
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    categoryId === c.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-100 bg-white'
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
          )}
        </Field>

        <Field label={`Thời gian mặc định: ${duration} phút`}>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>5m</span><span>2h</span>
          </div>
          {estimatedPoints > 0 && (
            <p className="text-sm text-amber-600 mt-1">≈ {estimatedPoints} XP mỗi lần check-in</p>
          )}
        </Field>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
        >
          {loading ? 'Đang lưu…' : 'Tạo habit'}
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
