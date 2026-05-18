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
      .eq('is_active', true)
      .order('name')
    setRewards(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function claimReward(reward: RewardProgress) {
    if (reward.available_points < reward.points_required) return { error: 'not enough points' }
    if (reward.is_claimed) return { error: 'already claimed' }

    const { error: claimError } = await supabase.from('reward_claims').insert({
      reward_id: reward.id,
      points_spent: reward.points_required,
      claimed_at: new Date().toISOString(),
    })
    if (claimError) return { error: claimError.message }

    const { error: rewardError } = await supabase.from('rewards').update({ is_claimed: true }).eq('id', reward.id)
    if (rewardError) return { error: rewardError.message }

    await fetch()
    return { error: null }
  }

  async function addReward(input: Omit<Reward, 'id' | 'created_at' | 'is_active' | 'is_claimed'>) {
    const { error } = await supabase.from('rewards').insert({ ...input, is_active: true, is_claimed: false })
    if (!error) fetch()
    return error
  }

  async function updateReward(id: string, updates: Partial<Reward>) {
    const { error } = await supabase.from('rewards').update(updates).eq('id', id)
    if (!error) fetch()
    return error
  }

  return { rewards, loading, claimReward, addReward, updateReward, refetch: fetch }
}
