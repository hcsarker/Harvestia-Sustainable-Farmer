import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useUserProgress } from './useUserProgress'

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
  const [totalChapters, setTotalChapters] = useState<number | null>(null)

  // Live progress signals for dynamic derivation
  const { courseProgress, storyProgress } = useUserProgress()

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
      const [{ data: ach }, { data: uach }, { data: ucert }, { data: chapters } ] = await Promise.all([
        supabase.from('achievements').select('id, name, description, icon'),
        supabase.from('user_achievements').select('id, achievement_id, earned_at').eq('user_id', user.id),
        // user_certificates might not be in generated types yet; cast to any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase as any).from('user_certificates').select('id').eq('user_id', user.id),
        supabase.from('story_chapters').select('id'),
      ])
      setAll((ach as Achievement[]) || [])
      setUserAch(uach || [])
      setCertCount((ucert as unknown[] | null)?.length || 0)
      setTotalChapters((chapters as unknown[] | null)?.length ?? null)
    } finally {
      setLoading(false)
    }
  }, [user, isGuest])

  useEffect(() => { fetchAll() }, [fetchAll])

  const earnedIds = useMemo(() => {
    // Start with what the DB says is earned
    const set = new Set(userAch.map(a => a.achievement_id))

    // 1) First certificate (or first course) — mark earned if any course is completed OR any certificate exists
    const anyCourseCompleted = courseProgress.some(cp => !!cp.completed)
    if (anyCourseCompleted || (certCount || 0) > 0) {
      // Add multiple possible ids to align with DB
      set.add('first_certificate')
      set.add('first_steps')
      set.add('course_graduate')
    }

    // 2) Story progress
    if (typeof totalChapters === 'number' && totalChapters > 0) {
      const completedChapters = storyProgress.filter(sp => sp.completed).length
      if (completedChapters >= 1) {
        set.add('welcome_farmer') // first story chapter
      }
      if (completedChapters >= totalChapters) {
        set.add('story_master') // all chapters
      }
    }

    // 3) Knowledge collector — N certificates earned
    if ((certCount || 0) >= 5) {
      set.add('knowledge_collector')
    }

    // Intersect with actual achievement ids to keep UI/count consistent
    const allIds = new Set(all.map(a => a.id))
    const filtered = new Set<string>()
    for (const id of set) {
      if (allIds.has(id)) filtered.add(id)
    }
    return filtered
  }, [userAch, courseProgress, storyProgress, totalChapters, certCount, all])

  return { loading, all, userAch, earnedIds, certCount, refresh: fetchAll }
}
