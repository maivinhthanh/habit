import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { HabitLog } from '../types/database'

export function useDayLogs(dateStr: string) {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('checked_at', dateStr + 'T00:00:00')
      .lte('checked_at', dateStr + 'T23:59:59')
    setLogs(data ?? [])
    setLoading(false)
  }, [dateStr])

  useEffect(() => { fetch() }, [fetch])

  const logByHabit = new Map<string, HabitLog>()
  for (const l of logs) logByHabit.set(l.habit_id, l)

  return { logs, logByHabit, loading }
}
