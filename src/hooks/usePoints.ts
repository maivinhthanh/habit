import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CurrentPoints } from '../types/database'

interface PointsContextValue {
  points: CurrentPoints | null
  loading: boolean
  refetch: () => Promise<void>
}

export const PointsContext = createContext<PointsContextValue>({
  points: null,
  loading: true,
  refetch: async () => {},
})

export function usePointsState() {
  const [points, setPoints] = useState<CurrentPoints | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('current_points').select('*').single()
    setPoints(data)
    setLoading(false)
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { points, loading, refetch }
}

export function usePoints() {
  return useContext(PointsContext)
}
