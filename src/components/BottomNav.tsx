import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', icon: '✅', label: 'Today' },
  { to: '/streak', icon: '🔥', label: 'Streak' },
  { to: '/rewards', icon: '🎁', label: 'Rewards' },
  { to: '/dashboard', icon: '📊', label: 'Points' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex safe-bottom z-50">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
              isActive ? 'text-violet-600' : 'text-gray-400'
            }`
          }
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
