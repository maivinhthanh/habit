import { Link } from 'react-router-dom'
import { useHabits } from '../hooks/useHabits'
import { useRewards } from '../hooks/useRewards'
import { useCategories } from '../hooks/useCategories'

export function SettingsPage() {
  const { habits } = useHabits()
  const { rewards } = useRewards()
  const { categories } = useCategories()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-safe-top pt-4 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Cài đặt</h1>
      </header>

      <div className="px-4 py-4 space-y-4">
        <Section
          title="Habits"
          addTo="/habits/new"
          addLabel="+ Thêm habit"
        >
          {habits.length === 0 && <EmptyRow text="Chưa có habit" />}
          {habits.map(h => (
            <Row key={h.id} icon={h.icon} name={h.name} sub={h.category_name} color={h.category_color} />
          ))}
        </Section>

        <Section
          title="Phần thưởng"
          addTo="/rewards/new"
          addLabel="+ Thêm reward"
        >
          {rewards.length === 0 && <EmptyRow text="Chưa có reward" />}
          {rewards.map(r => (
            <Row key={r.id} icon={r.icon} name={r.name} sub={`${r.points_required} XP`} />
          ))}
        </Section>

        <Section
          title="Danh mục"
          addTo="/categories/new"
          addLabel="+ Thêm category"
        >
          {categories.length === 0 && <EmptyRow text="Chưa có category" />}
          {categories.map(c => (
            <Row key={c.id} icon={c.icon} name={c.name} sub={`${c.points_per_minute} XP/min`} color={c.color} />
          ))}
        </Section>
      </div>
    </div>
  )
}

function Section({
  title, addTo, addLabel, children,
}: {
  title: string; addTo: string; addLabel: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <p className="font-semibold text-gray-800">{title}</p>
        <Link to={addTo} className="text-sm text-violet-600 font-medium">{addLabel}</Link>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  )
}

function Row({ icon, name, sub, color }: { icon: string; name: string; sub: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: color ? color + '20' : '#f3f4f6' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <p className="px-4 py-3 text-sm text-gray-400">{text}</p>
}
