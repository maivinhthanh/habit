import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Returns a Set of date strings ("YYYY-MM-DD") that were checked for each habit_id
export function useWeekLogs() {
  const [logMap, setLogMap] = useState<Map<string, Set<string>>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const monday = getMonday(new Date())
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      const from = monday.toISOString().slice(0, 10)
      const to = sunday.toISOString().slice(0, 10) + 'T23:59:59'

      const { data } = await supabase
        .from('habit_logs')
        .select('habit_id, checked_at')
        .gte('checked_at', from)
        .lte('checked_at', to)

      const map = new Map<string, Set<string>>()
      for (const row of data ?? []) {
        const date = row.checked_at.slice(0, 10)
        if (!map.has(row.habit_id)) map.set(row.habit_id, new Set())
        map.get(row.habit_id)!.add(date)
      }
      setLogMap(map)
      setLoading(false)
    }
    fetch()
  }, [])

  return { logMap, loading }
}

function getMonday(d: Date): Date {
  const day = d.getDay() // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? -6 : 1 - day)
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  return mon
}

export function getWeekDays(): Date[] {
  const mon = getMonday(new Date())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}
