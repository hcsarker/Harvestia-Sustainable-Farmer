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
import { useToast } from '@/hooks/use-toast'

type QuizRow = { id: string; title: string; difficulty: string | null; nasa_topic: string | null; questions_count: number | null; attempts_allowed?: number | null }

export default function QuizAdmin() {
  const { user, isGuest } = useAuth()
  const { toast } = useToast()
  const [quizzes, setQuizzes] = useState<QuizRow[]>([])
  const [loading, setLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
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

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      const { data, error } = await supabase.from('quizzes').select('count').limit(1)
      if (error) {
        toast({ 
          title: 'Database Connection Failed', 
          description: `Error: ${error.message}. Run setup SQL script in Supabase dashboard.`,
          variant: 'destructive' 
        })
      } else {
        toast({ 
          title: '✅ Database Connected!', 
          description: 'Quiz system is ready. You can create quizzes now.',
          variant: 'default'
        })
      }
    } catch (e) {
      toast({ 
        title: 'Connection Error', 
        description: 'Please check Supabase configuration.',
        variant: 'destructive' 
      })
    }
    setIsTestingConnection(false)
  }

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
    setLoading(true)
    const { error } = await supabase.from('quiz_questions').insert({
      quiz_id: selectedQuiz,
      question: qForm.question.trim(),
      options: opts,
      correct_answer: qForm.correct_answer.trim(),
      explanation: qForm.explanation || null,
    })
    setLoading(false)
    if (!error) {
      setQForm({ question: '', options: '', correct_answer: '', explanation: '' })
      toast({ title: '✅ Question Added', description: 'Question has been added to the quiz successfully.' })
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const deleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This will also delete all its questions.')) return
    setLoading(true)
    const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
    setLoading(false)
    if (!error) {
      setQuizzes(prev => prev.filter(q => q.id !== quizId))
      toast({ title: '✅ Quiz Deleted', description: 'Quiz and all its questions have been deleted.' })
    } else {
      toast({ title: 'Delete Error', description: error.message, variant: 'destructive' })
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
      
      {/* Setup Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">🚀 Quiz System Setup</CardTitle>
          <CardDescription className="text-blue-600">
            First time setup required! Please follow these steps:
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <div className="font-medium">Step 1: Run SQL Setup</div>
          <p>Copy content from <code>/supabase/sql/complete_setup.sql</code> and run it in your Supabase dashboard → SQL Editor</p>
          <div className="font-medium">Step 2: Test Connection</div>
          <p>Click "🔍 Test Database" button below to verify everything is working</p>
        </CardContent>
      </Card>

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
          <div className="md:col-span-3 flex gap-2">
            <Button onClick={testConnection} disabled={isTestingConnection} variant="outline">
              {isTestingConnection ? "Testing..." : "🔍 Test Database"}
            </Button>
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
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedQuiz(q.id)}
                    disabled={loading}
                  >
                    {selectedQuiz === q.id ? '✓ Selected' : 'Select'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => deleteQuiz(q.id)}
                    disabled={loading}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
