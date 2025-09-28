import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid3x3, 
  List, 
  Star, 
  Users, 
  Clock,
  Trophy,
  Gamepad2,
  Brain,
  Target,
  Zap
} from "lucide-react"
import { GameLauncher } from './GameLauncher'
import { UnityGameIntegration } from './UnityGameIntegration'

interface Game {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  duration: string
  highScore: number
  players: number
  rating: number
  gameUrl?: string
  isUnityGame: boolean
  gameId: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}

interface GameManagerProps {
  games: Game[]
  onGameClick: (game: Game) => void
}

type ViewMode = 'grid' | 'list'
type SortBy = 'rating' | 'players' | 'title' | 'difficulty'
type FilterBy = 'all' | 'unity' | 'quiz' | 'simulation' | 'educational'

export function GameManager({ games, onGameClick }: GameManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('rating')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showUnityIntegration, setShowUnityIntegration] = useState(false)

  // Filter games
  const filteredGames = useCallback(() => {
    let filtered = games.filter(game =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Apply category filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'unity':
          filtered = filtered.filter(game => game.isUnityGame)
          break
        case 'quiz':
          filtered = filtered.filter(game => game.category.toLowerCase().includes('quiz'))
          break
        case 'simulation':
          filtered = filtered.filter(game => game.category.toLowerCase().includes('simulation'))
          break
        case 'educational':
          filtered = filtered.filter(game => game.category.toLowerCase().includes('educational'))
          break
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'players':
          return b.players - a.players
        case 'title':
          return a.title.localeCompare(b.title)
        case 'difficulty': {
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 }
          return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
                 difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        }
        default:
          return 0
      }
    })

    return filtered
  }, [games, searchTerm, sortBy, filterBy])

  const handleGameSelect = (game: Game) => {
    if (game.isUnityGame && game.gameUrl) {
      setSelectedGame(game)
      setShowUnityIntegration(true)
    } else {
      onGameClick(game)
    }
  }

  const gameCategories = ['Unity Game', 'Quiz', 'Simulation', 'Educational', 'Strategy', 'Building']
  const unityGames = games.filter(g => g.isUnityGame)
  const regularGames = games.filter(g => !g.isUnityGame)

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gamepad2 className="h-5 w-5" />
            <span>Game Library</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterBy)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="unity">Unity Games</SelectItem>
                <SelectItem value="quiz">Quizzes</SelectItem>
                <SelectItem value="simulation">Simulations</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="players">Players</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center space-x-1 border rounded-md p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Categories Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Games ({games.length})</TabsTrigger>
          <TabsTrigger value="unity">Unity ({unityGames.length})</TabsTrigger>
          <TabsTrigger value="educational">Educational ({regularGames.length})</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames().map((game) => (
                <GameLauncher
                  key={game.id}
                  game={game}
                  onGameClick={handleGameSelect}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGames().map((game) => (
                <Card key={game.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg text-white ${game.color}`}>
                            <game.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{game.title}</h3>
                            <p className="text-sm text-muted-foreground">{game.category}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span>{game.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{game.players.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{game.duration}</span>
                        </div>
                        <Badge variant={game.difficulty === 'Easy' ? 'default' : game.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                          {game.difficulty}
                        </Badge>
                      </div>
                      
                      <Button 
                        onClick={() => handleGameSelect(game)}
                        disabled={!game.isUnityGame && !game.gameUrl}
                      >
                        {game.isUnityGame ? 'Play' : 'View'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unity" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unityGames.map((game) => (
              <GameLauncher
                key={game.id}
                game={game}
                onGameClick={handleGameSelect}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="educational" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularGames.map((game) => (
              <GameLauncher
                key={game.id}
                game={game}
                onGameClick={handleGameSelect}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Total Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{games.length}</div>
                <p className="text-xs text-muted-foreground">
                  {unityGames.length} Unity • {regularGames.length} Educational
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Total Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {games.reduce((sum, game) => sum + game.players, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all games
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Avg Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(games.reduce((sum, game) => sum + game.rating, 0) / games.length).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of 5.0
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Highest Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.max(...games.map(game => game.highScore)).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Best performance
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Unity Game Integration Modal */}
      {selectedGame && (
        <UnityGameIntegration
          gameId={selectedGame.gameId}
          title={selectedGame.title}
          description={selectedGame.description}
          gameUrl={selectedGame.gameUrl || ''}
          isOpen={showUnityIntegration}
          onClose={() => {
            setShowUnityIntegration(false)
            setSelectedGame(null)
          }}
        />
      )}
    </div>
  )
}