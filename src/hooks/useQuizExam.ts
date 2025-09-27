import { useCallback, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: string
  explanation?: string
}

interface QuizData {
  id: string
  title: string
  difficulty: string
  nasa_topic: string | null
  questions_count: number
  attempts_allowed: number
  questions: QuizQuestion[]
  attempts_left: number
}

interface QuizResult {
  score: number
  total_questions: number
  percentage: number
  passed: boolean
}

interface UserQuizResult {
  id: string
  user_id: string
  quiz_id: string
  score: number
  total_questions: number
  percentage: number
  completed_at: string
  quiz_title: string
  quiz_difficulty: string
}

export function useQuizExam() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const getQuizWithQuestions = useCallback(async (quizId: string): Promise<QuizData | null> => {
    setLoading(true)
    try {
      // Get quiz info
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, difficulty, nasa_topic, questions_count, attempts_allowed')
        .eq('id', quizId)
        .single()

      if (quizError) {
        toast({ title: 'Error', description: 'Quiz not found', variant: 'destructive' })
        return null
      }

      // Get quiz questions
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id, question, options, correct_answer, explanation')
        .eq('quiz_id', quizId)
        .order('created_at')

      if (questionsError) {
        toast({ title: 'Error', description: 'Failed to load questions', variant: 'destructive' })
        return null
      }

      // Process questions to ensure correct types
      const processedQuestions: QuizQuestion[] = (questions || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : 
                typeof q.options === 'string' ? [q.options] : []
      }))

      // Get user's previous attempts if logged in
      let attempts_used = 0
      if (user && !user.is_anonymous) {
        const { data: results } = await supabase
          .from('user_quiz_results')
          .select('id')
          .eq('quiz_id', quizId)
          .eq('user_id', user.id)

        attempts_used = results?.length || 0
      }

      const attempts_allowed = quiz.attempts_allowed || 5
      const attempts_left = Math.max(0, attempts_allowed - attempts_used)

      return {
        ...quiz,
        questions: processedQuestions,
        attempts_left
      }

    } catch (error) {
      console.error('Error loading quiz:', error)
      toast({ title: 'Error', description: 'Failed to load quiz', variant: 'destructive' })
      return null
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const submitQuizAnswers = useCallback(async (
    quizId: string, 
    answers: Record<string, string>
  ): Promise<QuizResult | null> => {
    if (!user || user.is_anonymous) {
      toast({ title: 'Error', description: 'Please log in to submit quiz', variant: 'destructive' })
      return null
    }

    setLoading(true)
    try {
      // Get quiz questions with correct answers
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id, correct_answer')
        .eq('quiz_id', quizId)

      if (questionsError || !questions) {
        toast({ title: 'Error', description: 'Failed to validate answers', variant: 'destructive' })
        return null
      }

      // Calculate score
      let correctAnswers = 0
      const totalQuestions = questions.length

      questions.forEach(question => {
        if (answers[question.id] === question.correct_answer) {
          correctAnswers++
        }
      })

      const percentage = Math.round((correctAnswers / totalQuestions) * 100)
      const passed = percentage >= 70

      // Save result to database
      const { error: saveError } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score: correctAnswers,
          total_questions: totalQuestions,
          answers,
          completed_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving quiz result:', saveError)
        toast({ title: 'Warning', description: 'Quiz submitted but result not saved', variant: 'destructive' })
      } else {
        // Check for achievements
        let achievementEarned = ''
        if (percentage === 100) {
          achievementEarned = 'Perfect Score'
        } else if (percentage >= 90) {
          achievementEarned = 'Silver Quiz'
        } else if (percentage >= 80) {
          achievementEarned = 'Bronze Quiz'
        }

        if (achievementEarned) {
          toast({ 
            title: '🏆 Achievement Unlocked!', 
            description: `You scored ${correctAnswers}/${totalQuestions} (${percentage}%) and earned ${achievementEarned}!`,
          })
        } else {
          toast({ 
            title: 'Quiz Submitted!', 
            description: `You scored ${correctAnswers}/${totalQuestions} (${percentage}%)`,
            variant: passed ? 'default' : 'destructive'
          })
        }
      }

      return {
        score: correctAnswers,
        total_questions: totalQuestions,
        percentage,
        passed
      }

    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({ title: 'Error', description: 'Failed to submit quiz', variant: 'destructive' })
      return null
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const getUserQuizResults = useCallback(async (): Promise<UserQuizResult[]> => {
    if (!user || user.is_anonymous) return []

    try {
      const { data, error } = await supabase
        .from('user_quiz_results')
        .select(`
          id,
          user_id,
          quiz_id,
          score,
          total_questions,
          completed_at,
          quizzes!inner(title, difficulty)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (error) {
        console.error('Error fetching results:', error)
        return []
      }

      return (data || []).map(result => ({
        ...result,
        percentage: Math.round((result.score / result.total_questions) * 100),
        quiz_title: (result.quizzes as any).title,
        quiz_difficulty: (result.quizzes as any).difficulty
      }))

    } catch (error) {
      console.error('Error fetching quiz results:', error)
      return []
    }
  }, [user])

  return {
    loading,
    getQuizWithQuestions,
    submitQuizAnswers,
    getUserQuizResults
  }
}