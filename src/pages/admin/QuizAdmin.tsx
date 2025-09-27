import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

type QuizRow = { 
  id: string; 
  title: string; 
  difficulty: string | null; 
  nasa_topic: string | null; 
  questions_count: number | null; 
  attempts_allowed?: number | null 
}

export default function QuizAdmin() {
  const { user, isGuest } = useAuth()
  const { toast } = useToast()
  const [quizzes, setQuizzes] = useState<QuizRow[]>([])
  const [loading, setLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [newQuiz, setNewQuiz] = useState({ title: '', difficulty: 'Easy', nasa_topic: '', attempts_allowed: 5 })
  const [selectedQuiz, setSelectedQuiz] = useState<string>('')
  const [qForm, setQForm] = useState({ question: '', options: '', correct_answer: '', explanation: '' })
  const [refreshKey, setRefreshKey] = useState(0)

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
          description: `Error: ${error.message}. Tables might not exist. Try running database setup.`,
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

  const loadQuizzes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, difficulty, nasa_topic')
        .order('created_at', { ascending: true })
      
      if (error) {
        toast({ title: 'Error', description: 'Failed to load quizzes', variant: 'destructive' })
        return
      }
      
      // Get question counts for each quiz
      const quizzesWithCounts = []
      for (const quiz of data || []) {
        const { count } = await supabase
          .from('quiz_questions')
          .select('*', { count: 'exact', head: true })
          .eq('quiz_id', quiz.id)
        
        quizzesWithCounts.push({
          ...quiz,
          questions_count: count || 0
        })
      }
      
      setQuizzes(quizzesWithCounts as QuizRow[])
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load quizzes', variant: 'destructive' })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadQuizzes()
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const createQuiz = async () => {
    if (!newQuiz.title.trim()) {
      toast({ title: 'Error', description: 'Please enter a quiz title', variant: 'destructive' })
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.from('quizzes').insert({
        title: newQuiz.title.trim(),
        difficulty: newQuiz.difficulty,
        nasa_topic: newQuiz.nasa_topic || null,
      })
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' })
        return
      }
      
      toast({ title: 'Success', description: 'Quiz created successfully!' })
      setNewQuiz({ title: '', difficulty: 'Easy', nasa_topic: '', attempts_allowed: 5 })
      setRefreshKey(prev => prev + 1) // Trigger refresh
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create quiz', variant: 'destructive' })
    }
    setLoading(false)
  }

  const addQuestion = async () => {
    if (!selectedQuiz) {
      toast({ title: 'Error', description: 'Please select a quiz first', variant: 'destructive' })
      return
    }
    
    const opts = qForm.options.split(',').map(s => s.trim()).filter(Boolean)
    
    if (!qForm.question.trim()) {
      toast({ title: 'Error', description: 'Please enter a question', variant: 'destructive' })
      return
    }
    
    if (opts.length < 2) {
      toast({ title: 'Error', description: 'Please provide at least 2 options (comma-separated)', variant: 'destructive' })
      return
    }
    
    if (!qForm.correct_answer.trim()) {
      toast({ title: 'Error', description: 'Please enter the correct answer', variant: 'destructive' })
      return
    }
    
    if (!opts.includes(qForm.correct_answer.trim())) {
      toast({ title: 'Error', description: 'Correct answer must match one of the options exactly', variant: 'destructive' })
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.from('quiz_questions').insert({
        quiz_id: selectedQuiz,
        question: qForm.question.trim(),
        options: opts,
        correct_answer: qForm.correct_answer.trim(),
        explanation: qForm.explanation || null,
      })
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' })
        return
      }
      
      setQForm({ question: '', options: '', correct_answer: '', explanation: '' })
      toast({ title: '✅ Question Added', description: 'Question has been added to the quiz successfully.' })
      setRefreshKey(prev => prev + 1) // Refresh to update question counts
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add question', variant: 'destructive' })
    }
    setLoading(false)
  }

  const deleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This will also delete all its questions.')) return
    
    setLoading(true)
    try {
      // First delete all questions for this quiz
      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId)
      
      if (questionsError) {
        toast({ title: 'Error', description: 'Failed to delete quiz questions', variant: 'destructive' })
        return
      }
      
      // Then delete the quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)
      
      if (quizError) {
        toast({ title: 'Error', description: quizError.message, variant: 'destructive' })
        return
      }
      
      toast({ title: '✅ Quiz Deleted', description: 'Quiz and all its questions have been deleted.' })
      setRefreshKey(prev => prev + 1) // Refresh the list
      
      // Clear selection if deleted quiz was selected
      if (selectedQuiz === quizId) {
        setSelectedQuiz('')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete quiz', variant: 'destructive' })
    }
    setLoading(false)
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
      
      {/* Quiz Statistics Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.reduce((sum, q) => sum + (q.questions_count || 0), 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Easy Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{quizzes.filter(q => q.difficulty === 'Easy').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hard Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{quizzes.filter(q => q.difficulty === 'Hard').length}</div>
          </CardContent>
        </Card>
      </div>

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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quiz Management</CardTitle>
            <CardDescription>Manage existing quizzes and their questions</CardDescription>
          </div>
          <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="outline" size="sm" disabled={loading}>
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {loading && quizzes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              Loading quizzes...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No quizzes found. Create your first quiz above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map(q => {
                const difficultyColors = q.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                return (
                  <div key={q.id} className={`border-2 rounded-lg p-4 ${selectedQuiz === q.id ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{q.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>📚 {q.questions_count || 0} questions</div>
                          <div>🎯 {q.attempts_allowed || 5} attempts</div>
                          <div>🛰️ {q.nasa_topic || 'No topic'}</div>
                          <div>🆔 {q.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant={selectedQuiz === q.id ? "default" : "outline"}
                          onClick={() => setSelectedQuiz(selectedQuiz === q.id ? '' : q.id)}
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
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}