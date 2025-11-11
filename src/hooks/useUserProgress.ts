import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from '@/hooks/use-toast'

interface CourseProgress {
  id: string
  course_id: string
  progress: number
  completed: boolean
  started_at: string
  completed_at?: string
}

interface StoryProgress {
  id: string
  chapter_id: string
  progress: number
  status: string
  completed: boolean
  started_at?: string
  completed_at?: string
}

interface GameScore {
  id: string
  game_id: string
  score: number
  high_score: number
  times_played: number
  last_played: string
}

export const useUserProgress = () => {
  // Minimal RPC wrapper to avoid generated type coupling for custom SQL functions
  const callRpc = useCallback(
    (name: string, args: Record<string, unknown>) =>
      (supabase as unknown as { rpc: (n: string, a: Record<string, unknown>) => Promise<unknown> }).rpc(name, args),
    []
  )

  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [storyProgress, setStoryProgress] = useState<StoryProgress[]>([])
  const [gameScores, setGameScores] = useState<GameScore[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user, isGuest } = useAuth()
  const { toast } = useToast()

  const fetchUserProgress = useCallback(async () => {
    if (!user || isGuest) {
      setLoading(false)
      return
    }

    try {
      // Fetch course progress
      const { data: courseData, error: courseError } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)

      if (courseError) throw courseError

      // Fetch story progress
      console.log('useUserProgress: Fetching story progress for user:', user.id)
      const { data: storyData, error: storyError } = await supabase
        .from('user_story_progress')
        .select('*')
        .eq('user_id', user.id)

      console.log('useUserProgress: Story progress result:', { storyData, storyError })
      
      if (storyError) throw storyError

      // Fetch game scores
      const { data: gameData, error: gameError } = await supabase
        .from('user_game_scores')
        .select('*')
        .eq('user_id', user.id)

      if (gameError) throw gameError

      setCourseProgress(courseData || [])
      // Deduplicate per chapter_id preferring completed or highest progress
      type StoryProgressRow = {
        id: string
        chapter_id: string
        progress: number
        status: string
        completed: boolean
        started_at?: string
        completed_at?: string
      }
      const rows: StoryProgressRow[] = (storyData || []) as unknown as StoryProgressRow[]

      const dedupMap: Record<string, StoryProgress> = {}
      for (const row of rows) {
        const key = row.chapter_id
        const existing = dedupMap[key]
        if (!existing || row.completed || row.progress > (existing.progress ?? 0)) {
          dedupMap[key] = row
        }
      }
      setStoryProgress(Object.values(dedupMap))
      setGameScores(gameData || [])
    } catch (error) {
      console.error('Error fetching user progress:', error)
      toast({
        title: "Error",
        description: "Failed to load your progress",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user, isGuest, toast])

  useEffect(() => {
    fetchUserProgress()
  }, [fetchUserProgress])

  const updateCourseProgress = useCallback(async (courseId: string, progress: number) => {
    if (!user || isGuest) return

    try {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          progress,
          completed: progress >= 100
        }, { onConflict: 'user_id,course_id' })

      if (error) throw error

      await fetchUserProgress()
      
      toast({
        title: "Progress Updated",
        description: `Course progress: ${progress}%`
      })
    } catch (error) {
      console.error('Error updating course progress:', error)
    }
  }, [user, isGuest, fetchUserProgress, toast])

  const updateStoryProgress = useCallback(async (chapterId: string, progress: number, status: string) => {
    if (!user || isGuest) return

    try {
      const { error } = await supabase
        .from('user_story_progress')
        .upsert({
          user_id: user.id,
          chapter_id: chapterId,
          progress,
          status,
          completed: progress >= 100
        }, { onConflict: 'user_id,chapter_id' })

      if (error) throw error

      // If the chapter is completed, try to award achievements
      if (progress >= 100) {
        try {
          // 1) Find the chapter number to derive the code
          const { data: chapterRow } = await supabase
            .from('story_chapters')
            .select('chapter_number')
            .eq('id', chapterId)
            .single()

          const chapterNumber = (chapterRow?.chapter_number as number | undefined) ?? undefined

          if (chapterNumber) {
            // 2) Award per-chapter badge via RPC (server-side)
            const perChapterCode = `story_ch${chapterNumber}`
            await callRpc('record_achievement', { p_user: user.id, p_code: perChapterCode })
          }

          // 3) If all chapters are completed, award story master badge via RPC
          const [{ data: allChapters }, { data: myCompleted } ] = await Promise.all([
            supabase.from('story_chapters').select('id'),
            supabase.from('user_story_progress').select('id').eq('user_id', user.id).eq('completed', true),
          ])

          const total = allChapters?.length ?? 0
          const done = myCompleted?.length ?? 0
          if (total > 0 && done >= total) {
            await callRpc('record_achievement', { p_user: user.id, p_code: 'story_master' })
          }
        } catch (awardErr) {
          // Non-fatal: progress updated but achievement award failed
          console.warn('Achievement award skipped:', awardErr)
        }
      }

      await fetchUserProgress()
      
      toast({
        title: "Story Progress Updated",
        description: `Chapter progress: ${progress}%`
      })
    } catch (error) {
      console.error('Error updating story progress:', error)
    }
  }, [user, isGuest, fetchUserProgress, toast, callRpc])

  const updateGameScore = useCallback(async (gameId: string, score: number) => {
    if (!user || isGuest) return

    try {
      // Check existing score
      const { data: existingScore } = await supabase
        .from('user_game_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .single()

      const newHighScore = existingScore ? Math.max(existingScore.high_score, score) : score
      const timesPlayed = existingScore ? existingScore.times_played + 1 : 1

      const { error } = await supabase
        .from('user_game_scores')
        .upsert({
          user_id: user.id,
          game_id: gameId,
          score,
          high_score: newHighScore,
          times_played: timesPlayed,
          last_played: new Date().toISOString()
        })

      if (error) throw error

      await fetchUserProgress()
      
      if (score === newHighScore && existingScore) {
        toast({
          title: "New High Score!",
          description: `Score: ${score} points`
        })
      }
    } catch (error) {
      console.error('Error updating game score:', error)
    }
  }, [user, isGuest, fetchUserProgress, toast])

  return {
    courseProgress,
    storyProgress,
    gameScores,
    loading,
    updateCourseProgress,
    updateStoryProgress,
    updateGameScore,
    fetchUserProgress
  }
}