import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Gamepad2,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UnityGameIntegrationProps {
  gameId: string
  title: string
  description: string
  gameUrl: string
  onClose?: () => void
  isOpen: boolean
}

export function UnityGameIntegration({ 
  gameId, 
  title, 
  description, 
  gameUrl, 
  onClose,
  isOpen 
}: UnityGameIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Simulate loading progress for Unity games
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            setIsLoading(false)
            setGameStarted(true)
            clearInterval(interval)
            return 100
          }
          return prev + Math.random() * 10
        })
      }, 200)
      
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const handleStartGame = () => {
    setIsLoading(true)
    setLoadingProgress(0)
    setHasError(false)
  }

  const handleOpenExternal = () => {
    window.open(gameUrl, '_blank', 'noopener,noreferrer')
    if (onClose) onClose()
  }

  const handleRestart = () => {
    setGameStarted(false)
    setIsLoading(false)
    setLoadingProgress(0)
    setHasError(false)
  }

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        // Try to enter browser fullscreen
        const gameContainer = document.querySelector('.unity-game-container')
        if (gameContainer && gameContainer.requestFullscreen) {
          await gameContainer.requestFullscreen()
        } else {
          // Fallback to CSS fullscreen
          setIsFullscreen(true)
        }
      } catch (e) {
        // Fallback to CSS fullscreen
        setIsFullscreen(true)
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      } catch (e) {
        console.log('Exit fullscreen failed')
      }
      setIsFullscreen(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-6xl min-h-[700px] w-[90vw]",
        isFullscreen && "max-w-full h-full w-full"
      )}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <span>{title}</span>
              <Badge variant="outline">Unity WebGL</Badge>
            </DialogTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>

          {/* Game Container */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className={cn(
                "aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative",
                isFullscreen && "aspect-auto h-96"
              )}>
                {!gameStarted && !isLoading && !hasError && (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Ready to Play?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Unity WebGL game will load in your browser
                      </p>
                      <div className="space-y-2">
                        <Button onClick={handleStartGame} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Start Game
                        </Button>
                        <Button onClick={handleOpenExternal} variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Loading Unity Game...</h3>
                      <Progress value={loadingProgress} className="w-64 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {Math.round(loadingProgress)}% Complete
                      </p>
                    </div>
                  </div>
                )}

                {gameStarted && (
                  <div className="w-full h-full min-h-[600px] bg-black relative overflow-hidden unity-game-container">
                    <iframe
                      src={gameUrl.startsWith('http') ? gameUrl : `${window.location.origin}${gameUrl}`}
                      className="w-full h-full border-0 absolute top-0 left-0"
                      style={{minHeight: '600px', minWidth: '800px'}}
                      title={title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-pointer-lock allow-top-navigation-by-user-activation"
                      onError={() => setHasError(true)}
                      onLoad={() => setIsLoading(false)}
                    />
                    
                    {/* Game Controls Overlay */}
                    <div className="absolute top-2 right-2 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={handleRestart}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={handleOpenExternal}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {hasError && (
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <ExternalLink className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-red-700">Unable to Load Game</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        The game couldn't be loaded in the embedded player. Try opening it in a new tab.
                      </p>
                      <div className="space-y-2">
                        <Button onClick={handleOpenExternal} className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                        <Button onClick={handleRestart} variant="outline" className="w-full">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Game Tips */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🎮 Gaming Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Make sure your browser supports WebGL for best performance</li>
              <li>• Allow popups if the game opens in a new window</li>
              <li>• For fullscreen gaming, click the expand button</li>
              <li>• Some games may take a moment to load completely</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}