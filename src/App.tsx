import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { TodayPage } from './pages/TodayPage'
import { StreakPage } from './pages/StreakPage'
import { RewardsPage } from './pages/RewardsPage'
import { DashboardPage } from './pages/DashboardPage'
import { SettingsPage } from './pages/SettingsPage'
import { AddHabitPage } from './pages/AddHabitPage'
import { AddRewardPage } from './pages/AddRewardPage'
import { AddCategoryPage } from './pages/AddCategoryPage'

export default function App() {
  return (
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
      </Routes>
    </BrowserRouter>
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
