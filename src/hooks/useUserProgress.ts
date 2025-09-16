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
      const { data: storyData, error: storyError } = await supabase
        .from('user_story_progress')
        .select('*')
        .eq('user_id', user.id)

      if (storyError) throw storyError

      // Fetch game scores
      const { data: gameData, error: gameError } = await supabase
        .from('user_game_scores')
        .select('*')
        .eq('user_id', user.id)

      if (gameError) throw gameError

      setCourseProgress(courseData || [])
      setStoryProgress(storyData || [])
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
        })

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
        })

      if (error) throw error

      await fetchUserProgress()
      
      toast({
        title: "Story Progress Updated",
        description: `Chapter progress: ${progress}%`
      })
    } catch (error) {
      console.error('Error updating story progress:', error)
    }
  }, [user, isGuest, fetchUserProgress, toast])

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