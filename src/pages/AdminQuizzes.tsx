import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'

const isAdmin = (email?: string | null) => {
  const env = import.meta.env.VITE_ADMIN_EMAILS as string | undefined
  const list = (env || '').split(',').map(s => s.trim()).filter(Boolean)
  return !!(email && list.includes(email))
}

type QuizRow = { id: string; title: string; difficulty: string | null; questions_count: number | null; nasa_topic: string | null }

type Question = { id?: string; question: string; options: string[]; correct_answer: string; explanation?: string | null }

export default function AdminQuizzes() {
  const { user } = useAuth()
  const admin = isAdmin(user?.email)
  const [quizzes, setQuizzes] = useState<QuizRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!admin) { setLoading(false); return }
      const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: true })
      if (active) { setQuizzes((data as QuizRow[]) || []); setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [admin])

  if (!admin) return <div className="container py-8 text-muted-foreground">You are not authorized to access this page.</div>

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin · Quizzes</h1>
        <p className="text-muted-foreground">Create and edit quizzes and questions</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Quiz</CardTitle>
          <CardDescription>Fill the fields and add questions later</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <NewQuizForm onCreated={(q) => setQuizzes(prev => [...prev, q])} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {quizzes.map(q => (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{q.title}</CardTitle>
              <CardDescription>
                {q.questions_count ?? 0} questions • Difficulty: <Badge variant="secondary" className="ml-1">{q.difficulty ?? '—'}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Editor quizId={q.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function NewQuizForm({ onCreated }: { onCreated: (q: QuizRow) => void }) {
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('Easy')
  const [nasaTopic, setNasaTopic] = useState('')
  const [saving, setSaving] = useState(false)

  const onSave = async () => {
    if (!title) return
    setSaving(true)
    try {
      const { data, error } = await supabase.from('quizzes').insert({ title, difficulty, nasa_topic: nasaTopic }).select('*').single()
      if (error) throw error
      onCreated(data as QuizRow)
      setTitle(''); setDifficulty('Easy'); setNasaTopic('')
    } finally { setSaving(false) }
  }

  return (
    <div className="grid md:grid-cols-3 gap-2">
      <Input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input placeholder="Difficulty (Easy/Medium/Hard)" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
      <div className="flex gap-2">
        <Input placeholder="NASA topic (optional)" value={nasaTopic} onChange={(e) => setNasaTopic(e.target.value)} />
        <Button onClick={onSave} disabled={saving || !title}>{saving ? 'Saving…' : 'Create'}</Button>
      </div>
    </div>
  )
}

function Editor({ quizId }: { quizId: string }) {
  const [qs, setQs] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [newQ, setNewQ] = useState<Question>({ question: '', options: ['', '', '', ''], correct_answer: '' })
  const canSaveNew = useMemo(() => newQ.question && newQ.correct_answer && newQ.options.filter(Boolean).length >= 2, [newQ])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('quiz_questions').select('id, question, options, correct_answer, explanation').eq('quiz_id', quizId).order('created_at', { ascending: true })
      if (active) { setQs((data as Question[]) || []); setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [quizId])

  const saveNew = async () => {
    const payload = { quiz_id: quizId, question: newQ.question, options: newQ.options, correct_answer: newQ.correct_answer, explanation: newQ.explanation || null }
    const { data, error } = await supabase.from('quiz_questions').insert(payload).select('id, question, options, correct_answer, explanation').single()
    if (error) return
    setQs(prev => [...prev, data as Question])
    setNewQ({ question: '', options: ['', '', '', ''], correct_answer: '' })
  }

  const updateQuestion = async (index: number, field: keyof Question, value: string | string[] | null) => {
    const q = qs[index]
    const updated = { ...q, [field]: value }
    setQs(prev => prev.map((x, i) => i === index ? updated : x))
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 p-3 rounded-md border">
        <div className="text-sm text-muted-foreground">Add question</div>
        <Input placeholder="Question" value={newQ.question} onChange={(e) => setNewQ({ ...newQ, question: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          {newQ.options.map((opt, i) => (
            <Input key={i} placeholder={`Option ${i+1}`} value={opt} onChange={(e) => {
              const arr = [...newQ.options]; arr[i] = e.target.value; setNewQ({ ...newQ, options: arr })
            }} />
          ))}
        </div>
        <Input placeholder="Correct answer" value={newQ.correct_answer} onChange={(e) => setNewQ({ ...newQ, correct_answer: e.target.value })} />
        <Textarea placeholder="Explanation (optional)" value={newQ.explanation || ''} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })} />
        <div className="flex justify-end">
          <Button onClick={saveNew} disabled={!canSaveNew}>Add</Button>
        </div>
      </div>

      {loading ? <div className="text-sm text-muted-foreground">Loading questions…</div> : (
        <div className="space-y-3">
          {qs.map((q, idx) => (
            <div key={q.id || idx} className="p-3 border rounded-md">
              <div className="text-sm text-muted-foreground">Question {idx+1}</div>
              <Input className="mt-1" value={q.question} onChange={(e) => updateQuestion(idx, 'question', e.target.value)} />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {q.options.map((opt, i) => (
                  <Input key={i} value={opt} onChange={(e) => {
                    const arr = [...q.options]; arr[i] = e.target.value; updateQuestion(idx, 'options', arr)
                  }} />
                ))}
              </div>
              <Input className="mt-2" value={q.correct_answer} onChange={(e) => updateQuestion(idx, 'correct_answer', e.target.value)} />
              <Textarea className="mt-2" value={q.explanation || ''} onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
