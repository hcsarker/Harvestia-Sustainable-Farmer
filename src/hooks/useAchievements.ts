import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export interface Achievement {
  id: string
  name: string
  description?: string | null
  icon?: string | null
}

export interface UserAchievement {
  id: string
  achievement_id: string
  earned_at: string
}

export const useAchievements = () => {
  const { user, isGuest } = useAuth()
  const [all, setAll] = useState<Achievement[]>([])
  const [userAch, setUserAch] = useState<UserAchievement[]>([])
  const [certCount, setCertCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchAll = useCallback(async () => {
    if (!user || isGuest) {
      setAll([])
      setUserAch([])
      setCertCount(0)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [{ data: ach }, { data: uach }, { data: ucert } ] = await Promise.all([
        supabase.from('achievements').select('id, name, description, icon'),
        supabase.from('user_achievements').select('id, achievement_id, earned_at').eq('user_id', user.id),
        // user_certificates might not be in generated types yet; cast to any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase as any).from('user_certificates').select('id').eq('user_id', user.id),
      ])
      setAll((ach as Achievement[]) || [])
      setUserAch(uach || [])
      setCertCount((ucert as unknown[] | null)?.length || 0)
    } finally {
      setLoading(false)
    }
  }, [user, isGuest])

  useEffect(() => { fetchAll() }, [fetchAll])

  const earnedIds = useMemo(() => new Set(userAch.map(a => a.achievement_id)), [userAch])

  return { loading, all, userAch, earnedIds, certCount, refresh: fetchAll }
}
