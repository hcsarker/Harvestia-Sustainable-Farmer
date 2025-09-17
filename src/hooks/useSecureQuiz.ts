import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Quiz {
  id: string
  title: string
  difficulty: string
  nasa_topic: string | null
  questions_count: number
  quiz_questions: QuizQuestion[]
  attempted?: boolean
  last_result?: {
    score: number
    total_questions: number
    completed_at: string
  } | null
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  explanation: string | null
}

export interface QuizResult {
  score: number
  total_questions: number
  percentage: number
}

export interface UserQuizResultRow {
  id: string
  user_id: string
  quiz_id: string
  score: number
  total_questions: number
  completed_at: string
  answers: Record<string, string> | null
}

// Non-hook helper for fetching the current user's latest result for a quiz
export async function fetchMyQuizResult(quizId: string): Promise<UserQuizResultRow | null> {
  try {
    const { data, error } = await supabase
      .from('user_quiz_results')
      .select('*')
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data as unknown as UserQuizResultRow | null
  } catch (e) {
    console.warn('fetchMyQuizResult failed', e)
    return null
  }
}

// Simple in-memory caches with TTL to avoid repeated fetch slowness (e.g., edge cold starts)
const QUIZ_CACHE_TTL_MS = 2 * 60 * 1000 // 2 minutes
type CachedQuiz = { value: Quiz; ts: number }
type CachedQuizList = { value: Quiz[]; ts: number }
const quizCache = new Map<string, CachedQuiz>()
let quizListCache: CachedQuizList | null = null
const isFresh = (ts: number) => Date.now() - ts < QUIZ_CACHE_TTL_MS

// LocalStorage helpers (best-effort)
function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch { return null }
}
function lsSet<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

export const useSecureQuiz = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const getQuiz = async (quizId: string): Promise<Quiz | null> => {
    // Return cached quickly if fresh, and revalidate in background
    const cached = quizCache.get(quizId) || lsGet<CachedQuiz>(`quizCache:${quizId}`)
    if (cached && isFresh(cached.ts)) {
      // Fire-and-forget revalidation
      void (async () => {
        try {
          const { data, error } = await supabase.functions.invoke('quiz-handler', {
            body: { action: 'getQuiz', quizId }
          })
          if (!error && data?.quiz) {
            const fresh = { value: data.quiz as Quiz, ts: Date.now() }
            quizCache.set(quizId, fresh)
            lsSet(`quizCache:${quizId}`, fresh)
          }
        } catch { /* ignore */ }
      })()
      return cached.value
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('quiz-handler', {
        body: { action: 'getQuiz', quizId }
      })

      if (error) throw error
  const quiz = data.quiz as Quiz
  const wrap = { value: quiz, ts: Date.now() }
  quizCache.set(quizId, wrap)
  lsSet(`quizCache:${quizId}`, wrap)
      return quiz
    } catch (error: unknown) {
      console.error('Error fetching quiz:', error)
      toast({
        title: "Error",
        description: "Failed to load quiz. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // Edge function warm-up (best-effort, no state changes)
  let warmed = false
  const warm = async () => {
    if (warmed) return
    try {
      await supabase.functions.invoke('quiz-handler', { body: { action: 'ping' } })
      warmed = true
    } catch { /* ignore */ }
  }

  const submitQuiz = async (quizId: string, answers: Record<string, string>): Promise<QuizResult | null> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('quiz-handler', {
        body: { action: 'submitQuiz', quizId, answers }
      })

      // If edge function returned an error (e.g., 409 already attempted), handle gracefully
      if (error) {
        const msg = typeof (error as unknown as { message?: string }).message === 'string'
          ? (error as unknown as { message: string }).message
          : String(error)
        const isConflict = /Already attempted/i.test(msg)
        if (isConflict) {
          // No toast here; caller can decide how to proceed
          return null
        }
        throw error
      }

      const result = data.result
      toast({
        title: "Quiz Completed!",
        description: `You scored ${result.score}/${result.total_questions} (${result.percentage}%)`,
        variant: result.percentage >= 70 ? "default" : "destructive"
      })

      return result
    } catch (error: unknown) {
      console.error('Error submitting quiz:', error)
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const validateAnswer = async (questionId: string, answer: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('quiz-handler', {
        body: { action: 'validateAnswer', questionId, answer }
      })

      if (error) throw error
      return data.isCorrect
    } catch (error) {
      console.error('Error validating answer:', error)
      return false
    }
  }

  const hasAttempted = async (quizId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_quiz_results')
        .select('id')
        .eq('quiz_id', quizId)
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return !!data
    } catch (e) {
      console.warn('hasAttempted check failed', e)
      return false
    }
  }

  const getMyQuizResult = async (quizId: string): Promise<UserQuizResultRow | null> => {
    return fetchMyQuizResult(quizId)
  }

  const listQuizzesWithAttempt = async (): Promise<Quiz[]> => {
    // Serve cached quickly if fresh; revalidate in background
    const cached = quizListCache || lsGet<CachedQuizList>('quizListCache')
    if (cached && isFresh(cached.ts)) {
      // fire-and-forget revalidation
      void (async () => {
        try { await listQuizzesWithAttemptFresh() } catch { /* ignore */ }
      })()
      return cached.value
    }
    return listQuizzesWithAttemptFresh()
  }

  const listQuizzesWithAttemptFresh = async (): Promise<Quiz[]> => {
    const [quizzesRes, resultsRes] = await Promise.all([
      supabase.from('quizzes').select('*').order('created_at', { ascending: true }),
      supabase.from('user_quiz_results').select('quiz_id, score, total_questions, completed_at')
    ])

    if (quizzesRes.error) throw quizzesRes.error
    if (resultsRes.error) throw resultsRes.error

    const latestByQuiz = new Map<string, { score: number; total_questions: number; completed_at: string }>()
    for (const row of resultsRes.data ?? []) {
      const prev = latestByQuiz.get(row.quiz_id)
      if (!prev || new Date(row.completed_at) > new Date(prev.completed_at)) {
        latestByQuiz.set(row.quiz_id, {
          score: row.score,
          total_questions: row.total_questions,
          completed_at: row.completed_at,
        })
      }
    }

    const merged = (quizzesRes.data ?? []).map((q) => ({
      ...q,
      quiz_questions: [],
      attempted: latestByQuiz.has(q.id),
      last_result: latestByQuiz.get(q.id) ?? null,
    })) as unknown as Quiz[]

  quizListCache = { value: merged, ts: Date.now() }
  lsSet('quizListCache', quizListCache)
  return merged
  }

  return {
    loading,
    getQuiz,
    warm,
    // helpful in prefetch scenarios
    prefetchQuiz: async (quizId: string) => { await getQuiz(quizId) },
    submitQuiz,
    validateAnswer,
    hasAttempted,
    getMyQuizResult,
    listQuizzesWithAttempt
  }
}