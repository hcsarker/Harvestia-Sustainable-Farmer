import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy } from 'lucide-react'

type Row = {
  id: string
  quiz_id: string
  score: number
  total_questions: number
  completed_at: string
}

type QuizMap = Record<string, { title: string; difficulty?: string | null }>

export default function MyResults() {
  const { user, isGuest, loading: authLoading } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [quizzes, setQuizzes] = useState<QuizMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!user || isGuest) { setLoading(false); return }
      setLoading(true)
      try {
        const [r1, r2] = await Promise.all([
          supabase.from('user_quiz_results').select('id, quiz_id, score, total_questions, completed_at').order('completed_at', { ascending: false }),
          supabase.from('quizzes').select('id, title, difficulty')
        ])
        if (active) {
          setRows((r1.data as Row[]) || [])
          const map: QuizMap = {}
          for (const q of (r2.data || [])) { map[q.id] = { title: q.title, difficulty: q.difficulty } }
          setQuizzes(map)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [user, isGuest])

  const enriched = useMemo(() => rows.map(r => ({
    ...r,
    title: quizzes[r.quiz_id]?.title || 'Untitled Quiz',
    difficulty: quizzes[r.quiz_id]?.difficulty || null,
    percentage: r.total_questions ? Math.round((r.score / r.total_questions) * 100) : 0
  })), [rows, quizzes])

  if (authLoading || loading) {
    return (
      <div className="container py-10 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading results…
      </div>
    )
  }

  if (!user || isGuest) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>My Results</CardTitle>
            <CardDescription>Please sign in to view your quiz results.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center">
        <Trophy className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">My Results</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {enriched.length === 0 ? (
          <Card className="md:col-span-2"><CardHeader><CardTitle>No results yet</CardTitle><CardDescription>Take a quiz to see your results here.</CardDescription></CardHeader></Card>
        ) : enriched.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{r.title}</span>
                <Badge variant="secondary">{r.difficulty ?? '—'}</Badge>
              </CardTitle>
              <CardDescription>{new Date(r.completed_at).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-semibold">{r.score}/{r.total_questions}</div>
                <div className="text-muted-foreground">({r.percentage}%)</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
