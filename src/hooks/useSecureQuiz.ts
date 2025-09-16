import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Quiz {
  id: string
  title: string
  difficulty: string
  nasa_topic: string | null
  questions_count: number
  quiz_questions: QuizQuestion[]
}

interface QuizQuestion {
  id: string
  question: string
  options: any
  explanation: string | null
}

interface QuizResult {
  score: number
  total_questions: number
  percentage: number
}

export const useSecureQuiz = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const getQuiz = async (quizId: string): Promise<Quiz | null> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('quiz-handler', {
        body: { action: 'getQuiz', quizId }
      })

      if (error) throw error
      return data.quiz
    } catch (error: any) {
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

  const submitQuiz = async (quizId: string, answers: Record<string, string>): Promise<QuizResult | null> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('quiz-handler', {
        body: { action: 'submitQuiz', quizId, answers }
      })

      if (error) throw error

      const result = data.result
      toast({
        title: "Quiz Completed!",
        description: `You scored ${result.score}/${result.total_questions} (${result.percentage}%)`,
        variant: result.percentage >= 70 ? "default" : "destructive"
      })

      return result
    } catch (error: any) {
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

  return {
    loading,
    getQuiz,
    submitQuiz,
    validateAnswer
  }
}