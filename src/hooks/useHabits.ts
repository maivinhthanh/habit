import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { HabitStat, Habit } from '../types/database'
import { calculateStreak, isCheckedToday, isMilestone, streakBonus, today } from '../lib/utils'

export function useHabits() {
  const [habits, setHabits] = useState<HabitStat[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('habit_stats')
      .select('*')
      .order('name')
    setHabits(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function checkIn(habit: HabitStat, durationMinutes: number, note?: string) {
    if (isCheckedToday(habit.last_checked_at)) return { error: 'already checked today' }

    const newStreak = calculateStreak(habit.last_checked_at, habit.streak_current)
    const basePoints = habit.points_per_minute * durationMinutes
    const bonus = isMilestone(newStreak) ? streakBonus(newStreak) : 0
    const totalPoints = basePoints + bonus

    const { error: logError } = await supabase.from('habit_logs').insert({
      habit_id: habit.id,
      checked_at: new Date().toISOString(),
      duration_minutes: durationMinutes,
      points_earned: totalPoints,
      streak_at: newStreak,
      note: note ?? null,
    })
    if (logError) return { error: logError.message }

    const { error: habitError } = await supabase.from('habits').update({
      streak_current: newStreak,
      streak_best: Math.max(newStreak, habit.streak_best),
      last_checked_at: today(),
    }).eq('id', habit.id)
    if (habitError) return { error: habitError.message }

    await fetch()
    return { points: totalPoints, bonus, streak: newStreak, error: null }
  }

  async function addHabit(input: Omit<Habit, 'id' | 'created_at' | 'streak_current' | 'streak_best' | 'last_checked_at' | 'is_active'>) {
    const { error } = await supabase.from('habits').insert({
      ...input,
      streak_current: 0,
      streak_best: 0,
      last_checked_at: null,
      is_active: true,
    })
    if (!error) fetch()
    return error
  }

  async function updateHabit(id: string, updates: Partial<Habit>) {
    const { error } = await supabase.from('habits').update(updates).eq('id', id)
    if (!error) fetch()
    return error
  }

  return { habits, loading, checkIn, addHabit, updateHabit, refetch: fetch }
}
