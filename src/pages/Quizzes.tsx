import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSecureQuiz, type Quiz } from '@/hooks/useSecureQuiz'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { Brain, Trophy } from 'lucide-react'

export default function Quizzes() {
  const navigate = useNavigate()
  const { listQuizzesWithAttempt, loading, prefetchQuiz, warm } = useSecureQuiz()
  const { isAuthenticated, isGuest } = useAuth()
  const [items, setItems] = useState<Quiz[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        // best-effort edge warm-up to avoid cold start lag
        void warm()
        const qs = await listQuizzesWithAttempt()
        if (active) setItems(qs)
      } catch (e) {
        console.error('Failed to load quizzes', e)
      }
    }
    void load()
    return () => { active = false }
  }, [listQuizzesWithAttempt, warm])
  return (
    <div className="container py-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold flex items-center">
          <Brain className="h-7 w-7 mr-3 text-primary" />
          Quizzes
        </h1>
        <p className="text-muted-foreground mt-2">Test your knowledge and level up your sustainable farming skills</p>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading quizzes…</div>
      ) : null}
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((quiz, index) => (
          <Card 
            key={quiz.id}
            className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader>
              <CardTitle className="text-lg">{quiz.title}</CardTitle>
              <CardDescription>
                {(quiz.questions_count ?? 0)} questions • {quiz.difficulty ?? '—'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  {quiz.last_result ? (
                    <>Attempted • {quiz.last_result.score}/{quiz.last_result.total_questions}{typeof quiz.attempts_left === 'number' ? ` • Attempts left: ${quiz.attempts_left}` : ''}</>
                  ) : (
                    <>Not attempted{typeof quiz.attempts_left === 'number' ? ` • Attempts left: ${quiz.attempts_left}` : ''}</>
                  )}
                </span>
                <Badge variant={
                  quiz.difficulty === 'Easy' ? 'secondary' :
                  quiz.difficulty === 'Medium' ? 'default' : 'destructive'
                }>
                  {quiz.difficulty ?? '—'}
                </Badge>
              </div>
              {quiz.attempted && (quiz.attempts_left ?? 0) <= 0 ? (
                <Button className="w-full" variant="outline" size="sm" onMouseEnter={() => prefetchQuiz(quiz.id)} onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                  View Result
                </Button>
              ) : (
                <Button className="w-full" size="sm" onMouseEnter={() => prefetchQuiz(quiz.id)} onClick={async () => {
                  if (!isAuthenticated || isGuest) {
                    navigate('/auth')
                    return
                  }
                  // Prefetch to warm edge/cache, then navigate
                  try { await prefetchQuiz(quiz.id) } catch { /* ignore */ }
                  navigate(`/quizzes/${quiz.id}`)
                }}>
                  {quiz.attempted ? 'Retake Quiz' : 'Start Quiz'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
