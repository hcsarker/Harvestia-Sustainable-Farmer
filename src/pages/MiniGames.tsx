import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GameCard } from "@/components/GameCard"
import { StatsCard } from "@/components/StatsCard"
import { 
  Gamepad2, 
  Play, 
  Trophy, 
  Clock, 
  Users,
  Star,
  Target,
  Zap,
  Brain,
  TrendingUp,
  Award
} from "lucide-react"

const miniGames = [
  {
    id: 1,
    title: "Crop Rotation Master",
    description: "Plan the perfect crop rotation sequence to maximize yield and soil health.",
    category: "Strategy",
    difficulty: "Easy",
    duration: "5 min",
    highScore: 2450,
    players: 1250,
    rating: 4.6,
    icon: Target,
    color: "bg-green-500"
  },
  {
    id: 2,
    title: "Weather Pattern Quiz",
    description: "Test your knowledge of weather patterns and climate data interpretation.",
    category: "Quiz",
    difficulty: "Medium",
    duration: "3 min",
    highScore: 1890,
    players: 980,
    rating: 4.4,
    icon: Brain,
    color: "bg-blue-500"
  },
  {
    id: 3,
    title: "Irrigation Optimization",
    description: "Use satellite data to create the most efficient irrigation schedule.",
    category: "Simulation",
    difficulty: "Hard",
    duration: "10 min",
    highScore: 3200,
    players: 750,
    rating: 4.8,
    icon: Zap,
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "Pest Detective",
    description: "Identify crop diseases and pests from visual clues and symptoms.",
    category: "Educational",
    difficulty: "Medium",
    duration: "7 min",
    highScore: 1650,
    players: 1100,
    rating: 4.5,
    icon: Target,
    color: "bg-orange-500"
  },
  {
    id: 5,
    title: "Sustainable Farm Builder",
    description: "Design and build an eco-friendly farm using sustainable practices.",
    category: "Building",
    difficulty: "Easy",
    duration: "15 min",
    highScore: 4100,
    players: 1500,
    rating: 4.9,
    icon: Brain,
    color: "bg-emerald-500"
  },
  {
    id: 6,
    title: "NASA Data Challenge",
    description: "Analyze real NASA satellite data to make farming predictions.",
    category: "Data Analysis",
    difficulty: "Hard",
    duration: "12 min",
    highScore: 2890,
    players: 450,
    rating: 4.7,
    icon: Zap,
    color: "bg-indigo-500"
  }
]

const quizzes = [
  {
    id: 1,
    title: "Soil Health Basics",
    questions: 15,
    difficulty: "Beginner",
    completions: 2300
  },
  {
    id: 2,
    title: "Climate Change & Agriculture",
    questions: 20,
    difficulty: "Intermediate", 
    completions: 1800
  },
  {
    id: 3,
    title: "Precision Farming Technologies",
    questions: 25,
    difficulty: "Advanced",
    completions: 950
  }
]

export default function MiniGames() {
  const totalGames = miniGames.length;
  const totalPlayers = miniGames.reduce((sum, game) => sum + game.players, 0);
  const avgRating = (miniGames.reduce((sum, game) => sum + game.rating, 0) / totalGames).toFixed(1);
  const highestScore = Math.max(...miniGames.map(game => game.highScore));

  return (
    <div className="container py-6">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Gamepad2 className="h-8 w-8 mr-3 text-primary animate-float" />
              Mini Games & Quizzes
            </h1>
            <p className="text-muted-foreground mt-2">
              Learn through play! Test your knowledge and skills with fun interactive games
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Games"
          value={totalGames}
          icon={Gamepad2}
          animate={true}
        />
        <StatsCard
          title="Total Players"
          value={totalPlayers.toLocaleString()}
          icon={Users}
          animate={true}
        />
        <StatsCard
          title="Avg Rating"
          value={avgRating}
          icon={Star}
          animate={true}
        />
        <StatsCard
          title="Highest Score"
          value={highestScore.toLocaleString()}
          icon={Trophy}
          animate={true}
        />
      </div>

      <div className="grid gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Gamepad2 className="h-5 w-5 mr-2" />
            Interactive Games
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {miniGames.map((game, index) => (
              <GameCard
                key={game.id}
                title={game.title}
                description={game.description}
                category={game.category}
                difficulty={game.difficulty}
                duration={game.duration}
                highScore={game.highScore}
                players={game.players}
                rating={game.rating}
                icon={game.icon}
                color={game.color}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Knowledge Quizzes
          </h2>
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
                    {quiz.questions} questions • {quiz.difficulty}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      {quiz.completions.toLocaleString()} completions
                    </span>
                    <Badge variant={
                      quiz.difficulty === 'Beginner' ? 'secondary' :
                      quiz.difficulty === 'Intermediate' ? 'default' : 'destructive'
                    }>
                      {quiz.difficulty}
                    </Badge>
                  </div>
                  <Button className="w-full hover:scale-105 transition-transform" size="sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}