export interface Category {
  id: string
  name: string
  icon: string
  color: string
  points_per_minute: number
  is_active: boolean
  created_at?: string
}

export interface Habit {
  id: string
  name: string
  category_id: string
  icon: string
  duration_minutes: number
  streak_current: number
  streak_best: number
  last_checked_at: string | null
  is_active: boolean
  created_at?: string
}

export interface HabitLog {
  id: string
  habit_id: string
  checked_at: string
  duration_minutes: number
  points_earned: number
  streak_at: number
  note: string | null
}

export interface Reward {
  id: string
  name: string
  description: string | null
  icon: string
  points_required: number
  target_date: string | null
  is_active: boolean
  is_claimed: boolean
  created_at?: string
}

export interface RewardClaim {
  id: string
  reward_id: string
  points_spent: number
  claimed_at: string
}

// Views
export interface HabitStat {
  id: string
  name: string
  icon: string
  duration_minutes: number
  streak_current: number
  streak_best: number
  last_checked_at: string | null
  is_active: boolean
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  points_per_minute: number
  checked_today: boolean
  total_logs: number
  total_minutes: number
  total_points: number
}

export interface RewardProgress {
  id: string
  name: string
  description: string | null
  icon: string
  points_required: number
  target_date: string | null
  is_active: boolean
  is_claimed: boolean
  available_points: number
  progress_pct: number
  days_remaining: number | null
  xp_per_day_needed: number | null
}

export interface CurrentPoints {
  available_points: number
  total_earned: number
  total_spent: number
}

export interface Database {
  public: {
    Tables: {
      categories: { Row: Category; Insert: Omit<Category, 'id' | 'created_at'>; Update: Partial<Category> }
      habits: { Row: Habit; Insert: Omit<Habit, 'id' | 'created_at'>; Update: Partial<Habit> }
      habit_logs: { Row: HabitLog; Insert: Omit<HabitLog, 'id'>; Update: Partial<HabitLog> }
      rewards: { Row: Reward; Insert: Omit<Reward, 'id' | 'created_at'>; Update: Partial<Reward> }
      reward_claims: { Row: RewardClaim; Insert: Omit<RewardClaim, 'id'>; Update: Partial<RewardClaim> }
    }
    Views: {
      habit_stats: { Row: HabitStat }
      reward_progress: { Row: RewardProgress }
      current_points: { Row: CurrentPoints }
    }
  }
}
