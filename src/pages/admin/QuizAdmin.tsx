import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

type QuizRow = { id: string; title: string; difficulty: string | null; nasa_topic: string | null; questions_count: number | null; attempts_allowed?: number | null }

export default function QuizAdmin() {
  const { user, isGuest } = useAuth()
  const [quizzes, setQuizzes] = useState<QuizRow[]>([])
  const [loading, setLoading] = useState(false)
  const [newQuiz, setNewQuiz] = useState({ title: '', difficulty: 'Easy', nasa_topic: '', attempts_allowed: 5 })
  const [selectedQuiz, setSelectedQuiz] = useState<string>('')
  const [qForm, setQForm] = useState({ question: '', options: '', correct_answer: '', explanation: '' })

  const isAdmin = useMemo(() => {
    if (!user || isGuest) return false
    const allowRaw = (import.meta as unknown as { env: Record<string, string | undefined> }).env?.VITE_ADMIN_EMAILS
    const allowList = (allowRaw || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    const email = user.email?.toLowerCase() || ''
    return allowList.length ? allowList.includes(email) : false
  }, [user, isGuest])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
  const { data } = await supabase.from('quizzes').select('id, title, difficulty, nasa_topic, questions_count, attempts_allowed').order('created_at', { ascending: true })
  if (active) setQuizzes((data as unknown as QuizRow[]) || [])
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  const createQuiz = async () => {
    if (!newQuiz.title.trim()) return
    setLoading(true)
    const { data, error } = await supabase.from('quizzes').insert({
      title: newQuiz.title.trim(),
      difficulty: newQuiz.difficulty,
      nasa_topic: newQuiz.nasa_topic || null,
      attempts_allowed: newQuiz.attempts_allowed ?? 5,
    }).select('id, title, difficulty, nasa_topic, questions_count, attempts_allowed').single()
    setLoading(false)
  if (error) return
  setQuizzes(q => [...q, data as unknown as QuizRow])
    setNewQuiz({ title: '', difficulty: 'Easy', nasa_topic: '', attempts_allowed: 5 })
  }

  const addQuestion = async () => {
    if (!selectedQuiz) return
    const opts = qForm.options.split(',').map(s => s.trim()).filter(Boolean)
    if (!qForm.question.trim() || opts.length < 2 || !qForm.correct_answer.trim()) return
    const { error } = await supabase.from('quiz_questions').insert({
      quiz_id: selectedQuiz,
      question: qForm.question.trim(),
      options: opts,
      correct_answer: qForm.correct_answer.trim(),
      explanation: qForm.explanation || null,
    })
    if (!error) {
      setQForm({ question: '', options: '', correct_answer: '', explanation: '' })
    }
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Admin</CardTitle>
            <CardDescription>You are not authorized to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ask an administrator to add your email to VITE_ADMIN_EMAILS in the environment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Quiz</CardTitle>
          <CardDescription>Add a new quiz header; questions can be added after.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={newQuiz.title} onChange={(e) => setNewQuiz(v => ({ ...v, title: e.target.value }))} placeholder="Sustainable Practices" />
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={newQuiz.difficulty} onValueChange={(v) => setNewQuiz(s => ({ ...s, difficulty: v }))}>
              <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="attempts">Attempts Allowed</Label>
            <Input id="attempts" type="number" min={1} value={newQuiz.attempts_allowed}
              onChange={(e) => setNewQuiz(v => ({ ...v, attempts_allowed: Math.max(1, Number(e.target.value || 1)) }))}
            />
          </div>
          <div>
            <Label htmlFor="topic">NASA Topic (optional)</Label>
            <Input id="topic" value={newQuiz.nasa_topic} onChange={(e) => setNewQuiz(v => ({ ...v, nasa_topic: e.target.value }))} placeholder="Soil Moisture" />
          </div>
          <div className="md:col-span-3">
            <Button onClick={createQuiz} disabled={loading || !newQuiz.title.trim()}>Create Quiz</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
          <CardDescription>Select a quiz and add a question with options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Quiz</Label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger><SelectValue placeholder="Choose a quiz" /></SelectTrigger>
                <SelectContent>
                  {quizzes.map(q => (
                    <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Question</Label>
              <Input value={qForm.question} onChange={(e) => setQForm(s => ({ ...s, question: e.target.value }))} placeholder="What does soil moisture primarily affect?" />
            </div>
            <div className="md:col-span-3">
              <Label>Options (comma-separated)</Label>
              <Textarea value={qForm.options} onChange={(e) => setQForm(s => ({ ...s, options: e.target.value }))} placeholder="Plant water availability, Wind speed, Solar activity, Snow cover" />
            </div>
            <div>
              <Label>Correct Answer</Label>
              <Input value={qForm.correct_answer} onChange={(e) => setQForm(s => ({ ...s, correct_answer: e.target.value }))} placeholder="Plant water availability" />
            </div>
            <div className="md:col-span-2">
              <Label>Explanation (optional)</Label>
              <Input value={qForm.explanation} onChange={(e) => setQForm(s => ({ ...s, explanation: e.target.value }))} placeholder="Why this answer is correct" />
            </div>
          </div>
          <Button onClick={addQuestion} disabled={!selectedQuiz}>Add Question</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quizzes</CardTitle>
          <CardDescription>Existing quizzes overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {quizzes.map(q => (
              <div key={q.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">{q.title}</div>
                  <div className="text-xs text-muted-foreground">{q.difficulty ?? '—'} • {q.nasa_topic ?? '—'} • {q.questions_count ?? 0} questions • Attempts: {q.attempts_allowed ?? 5}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
