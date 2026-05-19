import { NavLink, Link } from 'react-router-dom'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around px-6 h-16">
        {/* Today / Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center justify-center w-11 h-11 rounded-2xl transition-all ${
              isActive ? 'bg-orange-50' : ''
            }`
          }
        >
          {({ isActive }) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5Z"
                stroke={isActive ? '#f97316' : '#d1d5db'}
                strokeWidth="2"
                fill={isActive ? '#fff7ed' : 'none'}
              />
              <path
                d="M9 21V13h6v8"
                stroke={isActive ? '#f97316' : '#d1d5db'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </NavLink>

        {/* Streak */}
        <NavLink
          to="/streak"
          className={({ isActive }) =>
            `flex items-center justify-center w-11 h-11 rounded-2xl transition-all text-2xl ${
              isActive ? 'bg-orange-50' : 'opacity-40'
            }`
          }
        >
          🔥
        </NavLink>

        {/* Add — center big button */}
        <Link
          to="/habits/new"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 shadow-lg shadow-orange-200 active:bg-orange-600 transition-colors -mt-5"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Rewards */}
        <NavLink
          to="/rewards"
          className={({ isActive }) =>
            `flex items-center justify-center w-11 h-11 rounded-2xl transition-all text-2xl ${
              isActive ? 'bg-orange-50' : 'opacity-40'
            }`
          }
        >
          🎁
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center justify-center w-11 h-11 rounded-2xl transition-all ${
              isActive ? 'bg-orange-50' : ''
            }`
          }
        >
          {({ isActive }) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke={isActive ? '#f97316' : '#d1d5db'}
                strokeWidth="2"
              />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                stroke={isActive ? '#f97316' : '#d1d5db'}
                strokeWidth="2"
              />
            </svg>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
