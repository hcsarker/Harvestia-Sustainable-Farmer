import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { courseCatalog, type Course, type Lesson } from '@/lib/courses'

type DbCourse = {
  id: string
  title: string
  description: string | null
  instructor: string | null
  duration: string | null
  difficulty: string | null
  rating: number | null
  students_count: number | null
  certificate: boolean | null
  lessons_count: number | null
  quick_facts?: string[] | null
}

function hasSupabaseEnv() {
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL || !!import.meta.env.VITE_SUPABASE_PROJECT_ID
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY || !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  return hasUrl && hasKey
}

function synthesizeLessons(count: number | null | undefined): Lesson[] {
  const total = Math.max(0, Math.min(50, count || 0))
  if (!total) return []
  const mins = [10, 12, 14, 16, 18]
  return new Array(total).fill(null).map((_, i) => ({
    id: `lesson-${i + 1}`,
    title: `Lesson ${i + 1}`,
    minutes: mins[i % mins.length],
  }))
}

function mapDbToUi(row: DbCourse): Course {
  return {
    id: row.id, // uuid
    title: row.title,
    description: row.description ?? '',
    instructor: row.instructor ?? 'Instructor',
    duration: row.duration ?? 'Self-paced',
    difficulty: (row.difficulty as Course['difficulty']) || 'Beginner',
    rating: Number(row.rating ?? 0),
    students: Number(row.students_count ?? 0),
    certificate: !!row.certificate,
    lessons: synthesizeLessons(row.lessons_count),
  }
}

export type UseCoursesCatalogResult = {
  courses: Course[]
  quickFacts: Record<string, string[]>
  loading: boolean
  error: string | null
}

export function useCoursesCatalog(): UseCoursesCatalogResult {
  const [dbCourses, setDbCourses] = useState<Course[] | null>(null)
  const [facts, setFacts] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    if (!hasSupabaseEnv()) {
      setDbCourses(null)
      setFacts({})
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id,title,description,instructor,duration,difficulty,rating,students_count,certificate,lessons_count,quick_facts')
        .order('created_at', { ascending: true })

      if (error) throw error

      const mapped = (data || []).map(mapDbToUi)
      const qf: Record<string, string[]> = {}
      for (const row of data || []) {
        if (row && (row as DbCourse).id) {
          const id = (row as DbCourse).id
          const list = ((row as DbCourse).quick_facts as string[] | null) || []
          if (list.length) qf[id] = list
        }
      }
      setDbCourses(mapped)
      setFacts(qf)
      setError(null)
    } catch (e) {
      console.warn('Failed to load courses from DB, falling back to local catalog:', e)
      setDbCourses(null)
      setFacts({})
      setError(e instanceof Error ? e.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const courses = useMemo(() => dbCourses ?? courseCatalog, [dbCourses])

  return { courses, quickFacts: facts, loading, error }
}
