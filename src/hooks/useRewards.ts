import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { RewardProgress, Reward } from '../types/database'

export function useRewards() {
  const [rewards, setRewards] = useState<RewardProgress[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('reward_progress')
      .select('*')
      .order('name')
    setRewards(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function claimReward(reward: RewardProgress) {
    const { data, error } = await supabase.rpc('claim_reward', { p_reward_id: reward.id })
    if (error) return { error: error.message }
    if (data?.error) return { error: data.error as string }
    await fetch()
    return { error: null }
  }

  async function addReward(input: Omit<Reward, 'id' | 'created_at' | 'is_active' | 'is_claimed'>) {
    const { error } = await supabase.from('rewards').insert({ ...input, is_active: true, is_claimed: false })
    if (error) console.error('addReward error:', JSON.stringify(error))
    else fetch()
    return error
  }

  async function updateReward(id: string, updates: Partial<Reward>) {
    const { error } = await supabase.from('rewards').update(updates).eq('id', id)
    if (!error) fetch()
    return error
  }

  async function deleteReward(id: string) {
    const { error } = await supabase.from('rewards').delete().eq('id', id)
    if (!error) fetch()
    return error
  }

  return { rewards, loading, claimReward, addReward, updateReward, deleteReward, refetch: fetch }
}
