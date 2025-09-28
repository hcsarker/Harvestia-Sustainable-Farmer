import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Play, ExternalLink, Gamepad2, Clock, Users, Star, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface GameData {
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
  color?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface GameLauncherProps {
  game: GameData
  onGameClick: (game: GameData) => void
}

export function GameLauncher({ game, onGameClick }: GameLauncherProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handlePlayGame = () => {
    onGameClick(game)
    setIsDialogOpen(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    if (category.includes('Unity')) return Gamepad2
    return Play
  }

  const CategoryIcon = getCategoryIcon(game.category)

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "p-2 rounded-lg text-white",
                  game.color || "bg-blue-500"
                )}>
                  <CategoryIcon className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {game.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs mt-1">
                    {game.category}
                  </Badge>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDialogOpen(true)
                }}
              >
                <Info className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {game.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{game.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{game.players.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  <span>{game.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge className={getDifficultyColor(game.difficulty)} variant="secondary">
                {game.difficulty}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">
                Best: {game.highScore.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={cn(
              "p-2 rounded-lg text-white",
              game.color || "bg-blue-500"
            )}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <span>{game.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {game.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-muted-foreground">Category</label>
              <p>{game.category}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Difficulty</label>
              <Badge className={getDifficultyColor(game.difficulty)} variant="secondary">
                {game.difficulty}
              </Badge>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Duration</label>
              <p className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{game.duration}</span>
              </p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Rating</label>
              <p className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                <span>{game.rating}/5.0</span>
              </p>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Players: <strong>{game.players.toLocaleString()}</strong></span>
              <span>High Score: <strong>{game.highScore.toLocaleString()}</strong></span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handlePlayGame}
              className="flex-1"
              disabled={!game.isUnityGame && !game.gameUrl}
            >
              {game.isUnityGame && game.gameUrl ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Play Game
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {game.isUnityGame ? 'Coming Soon' : 'View Details'}
                </>
              )}
            </Button>
            
            {game.isUnityGame && game.gameUrl && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(game.gameUrl, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {game.isUnityGame && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
              <strong>💡 Tip:</strong> Make sure to allow popups for the best gaming experience. 
              Some games may require Unity WebGL support in your browser.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}