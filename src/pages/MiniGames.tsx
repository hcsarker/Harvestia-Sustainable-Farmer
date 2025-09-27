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
    title: "Farm Life Unity",
    description: "Interactive farming simulation built with Unity WebGL. Plant crops, manage resources!",
    category: "Unity Game",
    difficulty: "Easy",
    duration: "15 min",
    highScore: 3200,
    players: 850,
    rating: 4.8,
    icon: Target,
    color: "bg-green-600",
    isUnityGame: true,
    gameId: "farming-sim",
    gameUrl: undefined
  },
  {
    id: 2,
    title: "Crop Rotation Master",
    description: "Plan the perfect crop rotation sequence to maximize yield and soil health.",
    category: "Strategy",
    difficulty: "Easy",
    duration: "5 min",
    highScore: 2450,
    players: 1250,
    rating: 4.6,
    icon: Target,
    color: "bg-green-500",
    isUnityGame: true,
    gameId: "crop-rotation",
    gameUrl: undefined
  },
  {
    id: 3,
    title: "Plant Growing Game",
    description: "Interactive plant growing and gardening simulator with Unity graphics.",
    category: "Unity Game", 
    difficulty: "Easy",
    duration: "10 min",
    highScore: 2800,
    players: 650,
    rating: 4.7,
    icon: Target,
    color: "bg-emerald-500",
    isUnityGame: true,
    gameId: "plant-game",
    gameUrl: undefined
  },
  {
    id: 4,
    title: "Weather Pattern Quiz",
    description: "Test your knowledge of weather patterns and climate data interpretation.",
    category: "Quiz",
    difficulty: "Medium",
    duration: "3 min",
    highScore: 1890,
    players: 980,
    rating: 4.4,
    icon: Brain,
    color: "bg-blue-500",
    isUnityGame: false,
    gameId: undefined,
    gameUrl: undefined
  },
  {
    id: 5,
    title: "Irrigation Optimization",
    description: "Use satellite data to create the most efficient irrigation schedule.",
    category: "Simulation",
    difficulty: "Hard",
    duration: "10 min",
    highScore: 3200,
    players: 750,
    rating: 4.8,
    icon: Zap,
    color: "bg-purple-500",
    isUnityGame: false,
    gameId: undefined,
    gameUrl: undefined
  },
  {
    id: 6,
    title: "Pest Detective",
    description: "Identify crop diseases and pests from visual clues and symptoms.",
    category: "Educational",
    difficulty: "Medium",
    duration: "7 min",
    highScore: 1650,
    players: 1100,
    rating: 4.5,
    icon: Target,
    color: "bg-orange-500",
    isUnityGame: false,
    gameId: undefined,
    gameUrl: undefined
  },
  {
    id: 7,
    title: "Sustainable Farm Builder",
    description: "Design and build an eco-friendly farm using sustainable practices.",
    category: "Building",
    difficulty: "Easy",
    duration: "15 min",
    highScore: 4100,
    players: 1500,
    rating: 4.9,
    icon: Brain,
    color: "bg-emerald-500",
    isUnityGame: false,
    gameId: undefined,
    gameUrl: undefined
  },
  {
    id: 8,
    title: "NASA Data Challenge",
    description: "Analyze real NASA satellite data to make farming predictions.",
    category: "Data Analysis",
    difficulty: "Hard",
    duration: "12 min",
    highScore: 2890,
    players: 450,
    rating: 4.7,
    icon: Zap,
    color: "bg-indigo-500",
    isUnityGame: false,
    gameId: undefined,
    gameUrl: undefined
  },
  
{
  id: 9,
  title: "Smart Farming Simulator",
  description: "Smart Farming Simulator is an engaging Unity WebGL game where players manage a modern farm using IoT devices and sustainable practices.",
  category: "Unity Game",
  difficulty: "Easy",
  duration: "10 min",
  highScore: 1000,
  players: 100,
  rating: 4.5,
  icon: Target,
  color: "bg-blue-600",
  isUnityGame: true,
  gameId: "custom-game", // বা
  gameUrl: "https://imtiazahmeddipto.itch.io/smartfarming"
}

]

// Quizzes moved to dedicated Quizzes page

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
              Mini Games
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
                isUnityGame={game.isUnityGame}
                gameId={game.gameId}
                gameUrl={game.gameUrl}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}