import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

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

// Local quiz catalog (fallback)
export const quizCatalog: Quiz[] = [
  {
    id: 'soil-health-basics',
    title: 'Soil Health Basics',
    difficulty: 'Easy',
    nasa_topic: 'Soil Moisture',
    questions_count: 10,
    attempts_allowed: 3
  },
  {
    id: 'climate-change-impact',
    title: 'Climate Change Impact',
    difficulty: 'Medium', 
    nasa_topic: 'Climate Data',
    questions_count: 15,
    attempts_allowed: 3
  },
  {
    id: 'satellite-imagery-analysis',
    title: 'Satellite Imagery Analysis',
    difficulty: 'Hard',
    nasa_topic: 'Remote Sensing',
    questions_count: 12,
    attempts_allowed: 2
  },
  {
    id: 'sustainable-practices',
    title: 'Sustainable Practices',
    difficulty: 'Easy',
    nasa_topic: 'Carbon Cycle',
    questions_count: 8,
    attempts_allowed: 3
  },
  {
    id: 'precision-agriculture',
    title: 'Precision Agriculture with NASA Data',
    difficulty: 'Intermediate',
    nasa_topic: 'MODIS',
    questions_count: 12,
    attempts_allowed: 3
  },
  {
    id: 'water-management',
    title: 'Smart Water Management',
    difficulty: 'Medium',
    nasa_topic: 'SMAP',
    questions_count: 10,
    attempts_allowed: 3
  }
]

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
    attempts_allowed: 3 // Default attempts
  }
}

export type UseQuizzesCatalogResult = {
  quizzes: Quiz[]
  loading: boolean
  error: string | null
  refreshQuizzes: () => Promise<void>
}

export function useQuizzesCatalog(): UseQuizzesCatalogResult {
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
      const { data, error } = await supabase
        .from('quizzes')
        .select('id,title,difficulty,nasa_topic,questions_count')
        .order('created_at', { ascending: true })

      if (error) throw error

      const mapped = (data || []).map(mapDbToUi)
      setDbQuizzes(mapped)
      setError(null)
    } catch (e) {
      console.warn('Failed to load quizzes from DB, falling back to local catalog:', e)
      setDbQuizzes(null)
      setError(e instanceof Error ? e.message : 'Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  // Use database quizzes if available, fallback to local catalog
  const quizzes = useMemo(() => {
    if (dbQuizzes && dbQuizzes.length > 0) {
      return dbQuizzes
    }
    return quizCatalog
  }, [dbQuizzes])

  return { 
    quizzes, 
    loading, 
    error, 
    refreshQuizzes: fetchQuizzes 
  }
}