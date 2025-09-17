import { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Trophy } from 'lucide-react'

type Row = {
  id: string
  quiz_id: string
  score: number
  total_questions: number
  completed_at: string
  quizzes: { title: string; difficulty: string | null } | null
}

export default function MyResults() {
  const { isAuthenticated, isGuest } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!isAuthenticated || isGuest) { setLoading(false); return }
      setLoading(true)
      const { data } = await supabase
        .from('user_quiz_results')
        .select('id, quiz_id, score, total_questions, completed_at, quizzes(title, difficulty)')
        .order('completed_at', { ascending: false })
      if (active) {
        setRows((data as unknown as Row[]) || [])
        setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [isAuthenticated, isGuest])

  const hasAny = rows.length > 0
  const average = useMemo(() => {
    if (!rows.length) return 0
    const total = rows.reduce((acc, r) => acc + (r.score / r.total_questions), 0)
    return Math.round((total / rows.length) * 100)
  }, [rows])

  if (!isAuthenticated || isGuest) {
    return <div className="container py-10 text-muted-foreground">Please sign in to view your results.</div>
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center"><Trophy className="h-5 w-5 mr-2 text-primary"/>My Results</h1>
          <p className="text-muted-foreground">Your quiz scores and history</p>
        </div>
        {hasAny && (
          <div className="text-sm text-muted-foreground">Average Score: <Badge variant="secondary">{average}%</Badge></div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading…</div>
      ) : !hasAny ? (
        <Card>
          <CardHeader>
            <CardTitle>No results yet</CardTitle>
            <CardDescription>Start a quiz to see your results here.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((r) => {
            const pct = Math.round((r.score / r.total_questions) * 100)
            return (
              <Card key={r.id} className="hover:shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{r.quizzes?.title ?? 'Quiz'}</CardTitle>
                  <CardDescription>
                    {new Date(r.completed_at).toLocaleString()} • Difficulty: <Badge variant="secondary" className="ml-1">{r.quizzes?.difficulty ?? '—'}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className="text-xl font-semibold">{r.score}/{r.total_questions}</div>
                  </div>
                  <Badge className={pct >= 80 ? 'bg-green-600' : ''}>{pct}%</Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
