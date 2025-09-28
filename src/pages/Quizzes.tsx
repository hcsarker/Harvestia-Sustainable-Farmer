import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AudioButton } from "@/components/ui/audio-button"
import { Trophy, Loader2 } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useQuizzesCatalog, type Quiz } from '@/hooks/useQuizzesCatalog'
// ...existing code...

export default function Quizzes() {
  const navigate = useNavigate()
  const { isAuthenticated, isGuest } = useAuth()
  const { quizzes, loading, error, refreshQuizzes } = useQuizzesCatalog()

  return (
    <div className="container py-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold flex items-center">
          <Trophy className="h-7 w-7 mr-3 text-primary" />
          Quizzes
        </h1>
        <p className="text-muted-foreground mt-2">Test your knowledge and level up your sustainable farming skills</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin"/> 
          Loading quizzes…
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No quizzes available at the moment.</p>
        </div>
      ) : null}
      <div className="grid md:grid-cols-3 gap-4">
        {quizzes.map((quiz, index) => (
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
                <div className="text-sm text-muted-foreground">
                  {quiz.last_result ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3 w-3" />
                        Score: {quiz.last_result.score}/{quiz.last_result.total_questions}
                      </div>
                      {typeof quiz.attempts_left === 'number' && (
                        <div>Attempts left: {quiz.attempts_left}</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      Not attempted
                      {typeof quiz.attempts_left === 'number' && (
                        <div>Attempts: {quiz.attempts_left}</div>
                      )}
                    </div>
                  )}
                </div>
                <Badge variant={
                  quiz.difficulty === 'Easy' ? 'secondary' :
                  quiz.difficulty === 'Medium' ? 'default' : 'destructive'
                }>
                  {quiz.difficulty ?? '—'}
                </Badge>
              </div>
              
              {quiz.nasa_topic && (
                <div className="mb-3 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  NASA Topic: {quiz.nasa_topic}
                </div>
              )}
              
              {quiz.attempted && (quiz.attempts_left ?? 0) <= 0 ? (
                <AudioButton className="w-full" variant="outline" size="sm" soundType="button" onClick={() => navigate(`/results`)}>
                  <Trophy className="h-4 w-4 mr-2" />
                  View Results
                </AudioButton>
              ) : (
                <AudioButton className="w-full" size="sm" soundType="button" onClick={() => {
                  if (!isAuthenticated || isGuest) {
                    navigate('/auth')
                    return
                  }
                  navigate(`/quizzes/${quiz.id}`)
                }}>
                  {quiz.attempted ? 'Retake Quiz' : 'Start Quiz'}
                </AudioButton>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
