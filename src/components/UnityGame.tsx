import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Play, Maximize2, Minimize2, RotateCcw, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UnityGameProps {
  gameId: string
  title: string
  description: string
  gameUrl?: string
  width?: number
  height?: number
  className?: string
}

export function UnityGame({ 
  gameId, 
  title, 
  description, 
  gameUrl,
  width = 800,
  height = 600,
  className 
}: UnityGameProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)
  const gameRef = useRef<HTMLIFrameElement>(null)

  // Default Unity WebGL games or placeholder games
  const defaultGames = {
    'crop-rotation': {
      url: 'https://games.construct.net/426/latest',
      title: 'Crop Rotation Master'
    },
    'farming-sim': {
      url: 'https://www.crazygames.com/embed/farmland',
      title: 'Farming Simulator'
    },
    'plant-game': {
      url: 'https://www.addictinggames.com/embed/html5-games/24609',
      title: 'Plant Growing Game'
    },
    'custom-game': {
      url: 'https://v6p9d9t4.ssl.hwcdn.net/html/6566498/index.html',
      title: 'Smart Farming Simulator',
      fallbackUrl: 'https://imtiazahmeddipto.itch.io/smartfarming'
    }
  }

  // Prioritize gameUrl if provided, otherwise use default game mappings
  const currentGame = gameUrl 
    ? { url: gameUrl, title } 
    : defaultGames[gameId as keyof typeof defaultGames]

  const handleStartGame = () => {
    setIsLoading(true)
    setGameStarted(true)
    setHasLoadError(false)
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const handleGameError = () => {
    setIsLoading(false)
    setHasLoadError(true)
  }

  const handleOpenExternalGame = () => {
    const game = currentGame as { url: string; title: string; fallbackUrl?: string }
    const url = game?.fallbackUrl || currentGame?.url
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleRestart = () => {
    if (gameRef.current) {
      const currentSrc = gameRef.current.src
      gameRef.current.src = ''
      setTimeout(() => {
        if (gameRef.current) {
          gameRef.current.src = currentSrc
        }
      }, 100)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!currentGame) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <p>Game not found: {gameId}</p>
          <p className="text-sm mt-2">Available games: crop-rotation, farming-sim, plant-game, custom-game</p>
        </div>
      </Card>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full hover:scale-105 transition-transform" size="sm">
          <Play className="h-4 w-4 mr-2" />
          Play {title}
        </Button>
      </DialogTrigger>
      
      <DialogContent className={cn(
        "max-w-4xl p-0 overflow-hidden",
        isFullscreen && "max-w-[95vw] max-h-[95vh]",
        className
      )}>
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-lg">
              <Play className="h-5 w-5 mr-2 text-primary" />
              {currentGame.title}
            </DialogTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                disabled={!gameStarted}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground px-0">
            {description}
          </p>
        </DialogHeader>

        <CardContent className="p-4 pt-0">
          <div className={cn(
            "relative bg-gray-900 rounded-lg overflow-hidden",
            isFullscreen ? "h-[80vh]" : "h-96"
          )}>
            {!gameStarted ? (
              // Game Start Screen
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-400 to-blue-500 text-white">
                <div className="text-center animate-fade-in">
                  <Play className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold mb-2">{currentGame.title}</h3>
                  <p className="text-sm opacity-90 mb-6 max-w-md">
                    {description || "Click Play to start the game!"}
                  </p>
                  <Button
                    onClick={handleStartGame}
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Game
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              // Loading Screen
              <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                <p className="text-lg font-semibold">Loading Game...</p>
                <p className="text-sm text-gray-300 mt-2">This might take a few moments</p>
              </div>
            ) : hasLoadError ? (
              // Error fallback with external link option
              <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white">
                <div className="text-center">
                  <div className="text-red-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Game Loading Failed</h3>
                  <p className="text-sm text-gray-300 mb-6 max-w-md">
                    The game couldn't load in the embedded player. Try opening it in a new tab.
                  </p>
                  <button
                    onClick={handleOpenExternalGame}
                    className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    🚀 Open Game in New Tab
                  </button>
                </div>
              </div>
            ) : (
              // Game Frame  
              <iframe
                ref={gameRef}
                src={currentGame.url}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="rounded-lg"
                title={`${currentGame.title} - Interactive Game`}
                aria-label={`Play ${currentGame.title}`}
                onLoad={() => setIsLoading(false)}
                onError={handleGameError}
              />
            )}
          </div>
          
          {gameStarted && !isLoading && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGameStarted(false)
                  setIsLoading(false)
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Exit Game
              </Button>
            </div>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}