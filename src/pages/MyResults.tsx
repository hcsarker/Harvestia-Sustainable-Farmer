import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, Calendar, Target } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQuizExam, type UserQuizResult } from '@/hooks/useQuizExam'

export default function MyResults() {
  const { user, isGuest, loading: authLoading } = useAuth()
  const [results, setResults] = useState<UserQuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { getUserQuizResults } = useQuizExam()

  useEffect(() => {
    let active = true
    async function load() {
      if (!active) return
      setLoading(true)
      
      try {
        const userResults = await getUserQuizResults()
        if (active) {
          setResults(userResults)
        }
      } catch (e) {
        if (active) {
          console.error('Error loading quiz results:', e)
          toast({ title: 'Error', description: 'Failed to load quiz results', variant: 'destructive' })
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    if (!authLoading && user && !isGuest) {
      void load()
    } else {
      setResults([])
      setLoading(false)
    }

    return () => { active = false }
  }, [user, isGuest, authLoading, getUserQuizResults, toast])

  if (authLoading || loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading results...</span>
        </div>
      </div>
    )
  }

  if (isGuest) {
    return (
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Trophy className="h-7 w-7 mr-3 text-primary" />
            My Quiz Results
          </h1>
          <p className="text-muted-foreground mt-2">Track your quiz performance and progress</p>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Login Required</p>
            <p className="text-muted-foreground">Please login to view your quiz results!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Trophy className="h-7 w-7 mr-3 text-primary" />
          My Quiz Results
        </h1>
        <p className="text-muted-foreground mt-2">Track your quiz performance and progress</p>
      </div>
      
      {results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No quiz results yet</p>
            <p className="text-muted-foreground">Take your first quiz to see results here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {result.quiz_title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      Completed on {new Date(result.completed_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={result.percentage >= 70 ? 'default' : 'destructive'}>
                      {result.percentage}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      Score: {result.score}/{result.total_questions}
                    </span>
                    <span className={`font-medium ${
                      result.percentage >= 70 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.percentage >= 70 ? '✅ Passed' : '❌ Failed'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pass: 70%+
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
