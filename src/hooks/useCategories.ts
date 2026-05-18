import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types/database'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setCategories(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function addCategory(input: Omit<Category, 'id' | 'created_at' | 'is_active'>) {
    const { error } = await supabase.from('categories').insert({ ...input, is_active: true })
    if (!error) fetch()
    return error
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    const { error } = await supabase.from('categories').update(updates).eq('id', id)
    if (!error) fetch()
    return error
  }

  return { categories, loading, addCategory, updateCategory, refetch: fetch }
}
