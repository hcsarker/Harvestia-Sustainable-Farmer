import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSecureQuiz, type Quiz, type QuizQuestion, type QuizResult, fetchMyQuizResult, type UserQuizResultRow } from '@/hooks/useSecureQuiz'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, ChevronLeft, ChevronRight, Timer, Trophy, CheckCircle2, XCircle } from 'lucide-react'

type Answers = Record<string, string>

export default function QuizExam() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { loading, getQuiz, submitQuiz } = useSecureQuiz()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [startAt, setStartAt] = useState<number | null>(null)
  const [staleLoad, setStaleLoad] = useState(false)

  // Total time: 60s per question
  const totalSeconds = useMemo(() => {
    return (quiz?.questions_count || quiz?.quiz_questions?.length || 0) * 60
  }, [quiz])

  // Initialize timer start once when quiz is available
  useEffect(() => {
    if (!quiz) return
    // set initial seconds left immediately for UI
    setSecondsLeft(totalSeconds || 0)
    if (startAt === null) {
      setStartAt(Date.now())
    }
  }, [quiz, totalSeconds, startAt])

  // Require authentication to take/view quiz
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth')
    }
  }, [authLoading, isAuthenticated, navigate])

  // If we're loading too long, show a friendly error instead of infinite spinner
  useEffect(() => {
    if ((loading || authLoading) && !quiz) {
      const t = setTimeout(() => setStaleLoad(true), 3500) // show fallback sooner
      return () => clearTimeout(t)
    } else {
      setStaleLoad(false)
    }
  }, [loading, authLoading, quiz])

  const handleSubmit = useCallback(async () => {
    if (!quizId) return
    setSubmitting(true)
    const res = await submitQuiz(quizId, answers)
    if (!res && quiz?.attempted && quiz.last_result) {
      setResult({
        score: quiz.last_result.score,
        total_questions: quiz.last_result.total_questions,
        percentage: Math.round((quiz.last_result.score / quiz.last_result.total_questions) * 100),
      })
    } else {
      setResult(res)
    }
    setSubmitting(false)
  }, [answers, quizId, submitQuiz, quiz])

  // Robust countdown based on startAt and totalSeconds
  useEffect(() => {
    if (startAt === null || !totalSeconds) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startAt) / 1000)
      const left = Math.max(0, totalSeconds - elapsed)
      setSecondsLeft(left)
      if (left <= 0) {
        void handleSubmit()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startAt, totalSeconds, handleSubmit])

  useEffect(() => {
    let active = true
    async function run() {
      if (!quizId) return
      const q = await getQuiz(quizId)
      if (active) {
        setQuiz(q)
        if (q?.attempted && q.last_result) {
          setResult({
            score: q.last_result.score,
            total_questions: q.last_result.total_questions,
            percentage: Math.round((q.last_result.score / q.last_result.total_questions) * 100),
          })
          // Try to fetch saved answers so Review section can display user selections
          // This is optional and depends on RLS allowing the user to read their own row
          try {
            const saved: UserQuizResultRow | null = await fetchMyQuizResult(quizId)
            if (saved?.answers) {
              setAnswers(saved.answers)
            }
          } catch (_) {
            // ignore if not available in this context
          }
        }
      }
    }
    void run()
    return () => { active = false }
  }, [quizId, getQuiz])

  const total = quiz?.quiz_questions?.length ?? 0
  const progress = useMemo(() => {
    if (!total) return 0
    const answered = Object.keys(answers).length
    return Math.round((answered / total) * 100)
  }, [answers, total])

  const currentQuestion = quiz?.quiz_questions?.[current]

  const onSelect = (questionId: string, value: string) => {
    setAnswers((a) => ({ ...a, [questionId]: value }))
  }

  const handlePrev = () => setCurrent((i) => Math.max(0, i - 1))
  const handleNext = () => setCurrent((i) => Math.min(total - 1, i + 1))

  // submit handled by memoized handleSubmit above

  // Avoid rendering spinner if we just redirected to /auth
  if (!isAuthenticated && !authLoading) return null

  if ((loading || authLoading) && !quiz && !staleLoad) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (staleLoad && !quiz) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Still loading…</CardTitle>
            <CardDescription>
              This is taking longer than usual. Please check your connection and that you are signed in.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>
            <Button onClick={() => { setStaleLoad(false); /* re-trigger by resetting quiz to force getQuiz effect */ setQuiz(null); }}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Quiz not found</CardTitle>
            <CardDescription>We couldn't load this quiz. Please go back and try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result) {
    return (
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-primary" />
              {quiz.title} — Result
            </h1>
            <p className="text-muted-foreground">You scored {result.score}/{result.total_questions} ({result.percentage}%).</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Difficulty: <Badge variant="secondary" className="ml-1">{quiz.difficulty}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="text-2xl font-semibold">{result.score}</div>
              </div>
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Total Questions</div>
                <div className="text-2xl font-semibold">{result.total_questions}</div>
              </div>
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Percentage</div>
                <div className="text-2xl font-semibold">{result.percentage}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional simple review: show what you answered. Server keeps correct answers hidden. */}
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
            <CardDescription>Your selections are shown below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quiz.quiz_questions?.map((q: QuizQuestion, idx: number) => (
                <div key={q.id} className="p-4 border rounded-md">
                  <div className="font-medium mb-2">Q{idx + 1}. {q.question}</div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Your answer: </span>
                    <Badge className="ml-1" variant="outline">{answers[q.id] ?? '—'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.questions_count || total} questions • Difficulty: <Badge variant="secondary" className="ml-1">{quiz.difficulty}</Badge></p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Timer className="h-4 w-4" />
            <span>{secondsLeft !== null ? formatTime(secondsLeft) : '—:—'}</span>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} />
          <div className="text-xs text-muted-foreground mt-1">{progress}% completed</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question {current + 1} of {total}</CardTitle>
          <CardDescription>
            {currentQuestion?.question}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion?.id] ?? ''}
            onValueChange={(v) => currentQuestion && onSelect(currentQuestion.id, v)}
            className="space-y-3"
          >
            {currentQuestion?.options?.map((opt: string, i: number) => (
              <div key={i} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/40">
                <RadioGroupItem id={`q_${currentQuestion.id}_${i}`} value={opt} />
                <Label htmlFor={`q_${currentQuestion.id}_${i}`} className="cursor-pointer flex-1">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Separator className="my-6" />

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={current === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            {current < total - 1 ? (
              <Button onClick={handleNext} disabled={!answers[currentQuestion?.id]}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}
