import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { CurrentPoints } from '../types/database'

export function usePoints() {
  const [points, setPoints] = useState<CurrentPoints | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('current_points').select('*').single()
    setPoints(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { points, loading, refetch: fetch }
}
