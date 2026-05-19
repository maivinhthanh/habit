import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { SwipeableRow } from '../components/SwipeableRow'
import type { Category } from '../types/database'

const ICONS = ['🏃', '📚', '🧘', '💪', '🎨', '🎵', '🧹', '🍎', '💧', '😴', '🌿', '✍️', '🚴', '🏊', '🧠', '🙏']
const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#0ea5e9', '#64748b',
]

type SheetState = { mode: 'add' } | { mode: 'edit'; category: Category } | null

export function SettingsPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const [sheet, setSheet] = useState<SheetState>(null)

  function openAdd() {
    setSheet({ mode: 'add' })
  }

  function openEdit(category: Category) {
    setSheet({ mode: 'edit', category })
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Xoá danh mục "${category.name}"?`)) return
    await deleteCategory(category.id)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Cài đặt</h1>
      </header>

      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="font-semibold text-gray-800">Danh mục</p>
            <button onClick={openAdd} className="text-sm text-violet-600 font-medium">+ Thêm</button>
          </div>
          <div>
            {categories.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">Chưa có danh mục</p>
            )}
            {categories.map(c => (
              <SwipeableRow
                key={c.id}
                onEdit={() => openEdit(c)}
                onDelete={() => handleDelete(c)}
              >
                <div className="flex items-center gap-3 px-4 py-3 bg-white">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: c.color + '20' }}
                  >
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.points_per_minute} XP/phút</p>
                  </div>
                </div>
              </SwipeableRow>
            ))}
          </div>
        </div>
      </div>

      {sheet && (
        <CategorySheet
          initial={sheet.mode === 'edit' ? sheet.category : undefined}
          onClose={() => setSheet(null)}
          onSave={async (data) => {
            if (sheet.mode === 'add') {
              const err = await addCategory(data)
              if (!err) setSheet(null)
            } else {
              const err = await updateCategory(sheet.category.id, data)
              if (!err) setSheet(null)
            }
          }}
        />
      )}
    </div>
  )
}

function CategorySheet({
  initial,
  onClose,
  onSave,
}: {
  initial?: Category
  onClose: () => void
  onSave: (data: Omit<Category, 'id' | 'created_at' | 'is_active'>) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? ICONS[0])
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [ppm, setPpm] = useState(initial?.points_per_minute ?? 5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!initial

  async function handleSave() {
    if (!name.trim()) { setError('Nhập tên danh mục'); return }
    setLoading(true)
    setError('')
    await onSave({ name: name.trim(), icon, color, points_per_minute: ppm })
    setLoading(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl max-w-lg mx-auto shadow-xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}
          </h2>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">✕</button>
        </div>

        <div className="px-4 pb-8 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Preview */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: color + '20' }}
            >
              {icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{name || 'Tên danh mục'}</p>
              <p className="text-xs text-gray-400">{ppm} XP/phút</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Tên danh mục</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Thể thao"
              className="input w-full"
            />
          </div>

          {/* Icon picker */}
          <div className="space-y-1">
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

          {/* Color picker */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Màu sắc</label>
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
          </div>

          {/* Points per minute */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Điểm/phút: {ppm} XP</label>
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
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
          >
            {loading ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
          </button>
        </div>
      </div>
    </>
  )
}
