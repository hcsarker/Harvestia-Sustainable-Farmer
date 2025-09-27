import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export type Quiz = {
  id: string
  title: string
  difficulty: string
  nasa_topic: string | null
  questions_count: number
  attempted?: boolean
  last_result?: {
    score: number
    total_questions: number
    completed_at: string
  } | null
  attempts_allowed?: number
  attempts_used?: number
  attempts_left?: number
}

type DbQuiz = {
  id: string
  title: string
  difficulty: string | null
  nasa_topic: string | null
  questions_count: number | null
}

// All quiz data now comes from database - no static catalog needed

function hasSupabaseEnv() {
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL || !!import.meta.env.VITE_SUPABASE_PROJECT_ID
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY || !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  return hasUrl && hasKey
}

function mapDbToUi(row: DbQuiz): Quiz {
  return {
    id: row.id,
    title: row.title,
    difficulty: row.difficulty || 'Easy',
    nasa_topic: row.nasa_topic,
    questions_count: Number(row.questions_count ?? 0),
    attempts_allowed: 3, // Default attempts
    attempted: false,
    attempts_used: 0,
    attempts_left: 3
  }
}

export type UseQuizzesCatalogResult = {
  quizzes: Quiz[]
  loading: boolean
  error: string | null
  refreshQuizzes: () => Promise<void>
}

export function useQuizzesCatalog(): UseQuizzesCatalogResult {
  const { user, isAuthenticated } = useAuth()
  const [dbQuizzes, setDbQuizzes] = useState<Quiz[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuizzes = useCallback(async () => {
    if (!hasSupabaseEnv()) {
      setDbQuizzes(null)
      setLoading(false)
      return
    }

    try {
      // Fetch basic quiz data with questions count
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, title, difficulty, nasa_topic, questions_count')
        .order('title', { ascending: true })

      if (quizzesError) {
        throw quizzesError
      }
      
      if (!quizzesData || quizzesData.length === 0) {
        setDbQuizzes([])
        setError(null)
        setLoading(false)
        return
      }
      
      // Get actual question counts from quiz_questions table for each quiz
      const quizPromises = quizzesData.map(async (quiz) => {
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('id')
          .eq('quiz_id', quiz.id)
        
        const actualQuestionsCount = questionsData?.length || 0
        
        // Get user attempts if authenticated
        let attempts_used = 0
        if (user && isAuthenticated && !user.is_anonymous) {
          const { data: attemptsData } = await supabase
            .from('user_quiz_results')
            .select('id')
            .eq('quiz_id', quiz.id)
            .eq('user_id', user.id)
          
          attempts_used = attemptsData?.length || 0
        }
        
        const attempts_allowed = 3
        const attempts_left = Math.max(0, attempts_allowed - attempts_used)
        
        return {
          id: quiz.id,
          title: quiz.title,
          difficulty: quiz.difficulty || 'Easy',
          nasa_topic: quiz.nasa_topic,
          questions_count: actualQuestionsCount,
          attempts_allowed,
          attempted: attempts_used > 0,
          attempts_used,
          attempts_left
        }
      })
      
      const enhanced = await Promise.all(quizPromises)

      // For now, just use the enhanced data as-is
      // TODO: Later add user attempts fetching when user system is ready
      setDbQuizzes(enhanced)
      setError(null)
    } catch (e) {
      setDbQuizzes(null)
      setError(e instanceof Error ? e.message : 'Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  // Use database quizzes only - no fallback
  const quizzes = useMemo(() => {
    return dbQuizzes || []
  }, [dbQuizzes])

  const refreshQuizzes = useCallback(() => {
    return fetchQuizzes()
  }, [fetchQuizzes])

  return { 
    quizzes, 
    loading, 
    error, 
    refreshQuizzes 
  }
}