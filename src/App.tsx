import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PointsContext, usePointsState } from './hooks/usePoints'
import { BottomNav } from './components/BottomNav'
import { TodayPage } from './pages/TodayPage'
import { StreakPage } from './pages/StreakPage'
import { RewardsPage } from './pages/RewardsPage'
import { DashboardPage } from './pages/DashboardPage'
import { SettingsPage } from './pages/SettingsPage'
import { AddHabitPage } from './pages/AddHabitPage'
import { AddRewardPage } from './pages/AddRewardPage'
import { AddCategoryPage } from './pages/AddCategoryPage'
import { HistoryPage } from './pages/HistoryPage'

export default function App() {
  const pointsState = usePointsState()
  return (
    <PointsContext.Provider value={pointsState}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><TodayPage /></Layout>} />
        <Route path="/streak" element={<Layout><StreakPage /></Layout>} />
        <Route path="/rewards" element={<Layout><RewardsPage /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        <Route path="/habits/new" element={<AddHabitPage />} />
        <Route path="/rewards/new" element={<AddRewardPage />} />
        <Route path="/categories/new" element={<AddCategoryPage />} />
        <Route path="/history" element={<Layout><HistoryPage /></Layout>} />
        <Route path="/history/:date" element={<Layout><HistoryPage /></Layout>} />
      </Routes>
    </BrowserRouter>
    </PointsContext.Provider>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto relative">
      {children}
      <BottomNav />
    </div>
  )
}
