import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GameCard } from "@/components/GameCard"
import { GameLauncher } from "@/components/GameLauncher"
import { GameManager } from "@/components/GameManager"
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
    gameUrl: "https://www.crazygames.com/embed/farmland"
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
    gameUrl: "https://games.construct.net/426/latest"
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
    gameUrl: "https://www.addictinggames.com/embed/html5-games/24609"
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
    gameId: "custom-game",
    gameUrl: "https://imtiazahmeddipto.itch.io/smartfarming"
  },
  {
    id: 10,
    title: "Solar Storm Survival",
    description: "Survive intense solar storms in this thrilling space adventure game. Navigate through dangerous cosmic weather and protect your spacecraft!",
    category: "Unity Game",
    difficulty: "Hard",
    duration: "15 min",
    highScore: 0,
    players: 0,
    rating: 5.0,
    icon: Zap,
    color: "bg-purple-600",
    isUnityGame: true,
    gameId: "solar-storm-survival",
    gameUrl: "/games/WebGL Build Solar Storm Sirvival/"
  },
  {
    id: 11,
    title: "Smart Farming Simulator Pro",
    description: "Advanced farming simulation with modern agricultural techniques. Manage crops, optimize resources, and build a sustainable farm!",
    category: "Unity Game",
    difficulty: "Medium",
    duration: "20 min",
    highScore: 0,
    players: 0,
    rating: 5.0,
    icon: Target,
    color: "bg-green-700",
    isUnityGame: true,
    gameId: "smart-farming-sim-custom",
    gameUrl: "/games/WenGL Build Smart Farming Sim/"
  }

]

// Quizzes moved to dedicated Quizzes page

export default function MiniGames() {
  const totalGames = miniGames.length;
  const totalPlayers = miniGames.reduce((sum, game) => sum + game.players, 0);
  const avgRating = (miniGames.reduce((sum, game) => sum + game.rating, 0) / totalGames).toFixed(1);
  const highestScore = Math.max(...miniGames.map(game => game.highScore));

  const handleGameClick = (game: typeof miniGames[0]) => {
    if (!game.isUnityGame) {
      // For non-Unity games, show coming soon message
      const message = game.category === 'Quiz' 
        ? `${game.title} - Visit the Quizzes section to test your knowledge!`
        : `${game.title} - Coming Soon! This educational game will be available in the next update.`;
      alert(message);
    } else if (game.gameUrl) {
      // For Unity games with URLs, open in new tab
      const confirmOpen = confirm(`${game.title} will open in a new tab. Make sure to allow popups for the best gaming experience!`);
      if (confirmOpen) {
        window.open(game.gameUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Fallback for games without URLs
      alert(`${game.title} - Game loading functionality coming soon! We're working on integrating more Unity WebGL games.`);
    }
  };

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

      <div className="mb-8">
        <GameManager
          games={miniGames}
          onGameClick={handleGameClick}
        />
      </div>
    </div>
  )
}