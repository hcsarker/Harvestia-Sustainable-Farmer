import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { AgricultureMap } from '@/components/AgricultureMap'
import { SimulationTimeline } from '@/components/SimulationTimeline'
import { DecisionsPanel } from '@/components/DecisionsPanel'
import { OutcomesPanel } from '@/components/OutcomesPanel'
import { CoachTips } from '@/components/CoachTips'
import { useNASAData } from '@/hooks/useNASAData'
import { useToast } from '@/hooks/use-toast'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Target,
  Sprout,
  MapPin,
  Settings,
  Globe
} from 'lucide-react'

interface GameState {
  mode: 'sandbox' | 'drought' | 'monsoon'
  crop: 'wheat' | 'rice' | 'maize'
  soilType: 'clay' | 'loam' | 'sandy'
  location: { lat: number; lng: number; name: string } | null
  currentWeek: number
  isPlaying: boolean
  playbackSpeed: number
  budget: number
  decisions: any[]
  outcomeData: any
  weatherForecast: string[]
}

const INITIAL_GAME_STATE: GameState = {
  mode: 'sandbox',
  crop: 'wheat',
  soilType: 'loam',
  location: null,
  currentWeek: 1,
  isPlaying: false,
  playbackSpeed: 1,
  budget: 50000,
  decisions: [],
  outcomeData: {
    yield: 0,
    targetYield: 4.5,
    soilMoisture: 25,
    etGap: 20,
    nitrogenLeached: 15,
    totalScore: 75,
    weeklyData: [],
    costs: { irrigation: 0, fertilizer: 0, total: 0 },
    revenue: 0,
    profit: 0
  },
  weatherForecast: ['Sunny', 'Cloudy', 'Rainy']
}

const SCENARIOS = {
  sandbox: {
    title: 'Sandbox Mode',
    description: 'Experiment with different crops, soils, and strategies across seasons.',
    duration: 52,
    objectives: ['Learn farming strategies', 'Optimize resource use', 'Maximize yield']
  },
  drought: {
    title: 'Drought Challenge',
    description: 'Limited water supply - maintain ≥80% yield while reducing water use by 40%.',
    duration: 30,
    objectives: ['Keep yield ≥80%', 'Reduce water use 40%', 'Manage crop stress']
  },
  monsoon: {
    title: 'Monsoon Management', 
    description: 'Time nitrogen application to avoid washout from forecasted rain bursts.',
    duration: 45,
    objectives: ['Optimize fertilizer timing', 'Prevent nutrient loss', 'Adapt to weather']
  }
}

export const AgriculturalSimulation = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const [showSetup, setShowSetup] = useState(true)
  const { toast } = useToast()
  
  const nasaData = useNASAData()

  // Simulation timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (gameState.isPlaying) {
      const weekDuration = 1000 / gameState.playbackSpeed // 1 second per week at 1x speed
      
      interval = setInterval(() => {
        setGameState(prev => {
          const scenario = SCENARIOS[prev.mode]
          if (prev.currentWeek >= scenario.duration) {
            // End simulation
            toast({
              title: "Simulation Complete!",
              description: `Final score: ${prev.outcomeData.totalScore}%`
            })
            return { ...prev, isPlaying: false }
          }
          
          // Update week and simulate progress
          const newWeek = prev.currentWeek + 1
          const updatedOutcomes = simulateWeekProgress(prev, newWeek)
          
          return {
            ...prev,
            currentWeek: newWeek,
            outcomeData: updatedOutcomes
          }
        })
      }, weekDuration)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameState.isPlaying, gameState.playbackSpeed, toast])

  const simulateWeekProgress = (state: GameState, week: number) => {
    // Simplified simulation logic
    const baseYield = 0.05 // Base weekly yield increase
    const moistureDecay = 0.02 // Weekly moisture decrease
    const weatherFactor = Math.random() * 0.1 - 0.05 // Random weather impact
    
    const newYield = state.outcomeData.yield + baseYield + weatherFactor
    const newMoisture = Math.max(10, state.outcomeData.soilMoisture - moistureDecay)
    
    // Update weekly data
    const newWeeklyData = [...state.outcomeData.weeklyData, {
      week,
      yield: newYield,
      moisture: newMoisture,
      et: state.outcomeData.etGap,
      nitrogen: state.outcomeData.nitrogenLeached
    }]
    
    // Calculate new score
    const yieldScore = Math.min(100, (newYield / state.outcomeData.targetYield) * 100)
    const moistureScore = newMoisture > 20 ? 100 : (newMoisture / 20) * 100
    const totalScore = (yieldScore + moistureScore) / 2
    
    return {
      ...state.outcomeData,
      yield: newYield,
      soilMoisture: newMoisture,
      totalScore,
      weeklyData: newWeeklyData,
      revenue: newYield * 500 * 10, // $500 per ton
      profit: (newYield * 500 * 10) - state.outcomeData.costs.total
    }
  }

  const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
    setGameState(prev => ({
      ...prev,
      location: { lat, lng, name: `${lat.toFixed(2)}, ${lng.toFixed(2)}` }
    }))
    
    // Fetch NASA data for the selected location
    try {
      const [smapData, modisData] = await Promise.all([
        nasaData.fetchSMAPData(`${lat},${lng}`),
        nasaData.fetchMODISData(`${lat},${lng}`)
      ])
      
      if (smapData) {
        setGameState(prev => ({
          ...prev,
          outcomeData: {
            ...prev.outcomeData,
            soilMoisture: smapData.data?.average_moisture || prev.outcomeData.soilMoisture
          }
        }))
      }
      
      toast({
        title: "Location Data Loaded",
        description: "NASA satellite data integrated for your selected location."
      })
    } catch (error) {
      console.error('Failed to load NASA data:', error)
    }
  }, [nasaData, toast])

  const handleDecisionMake = useCallback((decision: any) => {
    setGameState(prev => {
      const newCosts = { ...prev.outcomeData.costs }
      newCosts[decision.type] += decision.cost
      newCosts.total += decision.cost
      
      return {
        ...prev,
        budget: prev.budget - decision.cost,
        decisions: [...prev.decisions, decision],
        outcomeData: {
          ...prev.outcomeData,
          costs: newCosts
        }
      }
    })
    
    toast({
      title: "Decision Scheduled",
      description: `${decision.title} will be applied in week ${decision.week}.`
    })
  }, [toast])

  const startNewSimulation = (mode: GameState['mode'], crop: GameState['crop'], soilType: GameState['soilType']) => {
    const scenario = SCENARIOS[mode]
    
    setGameState({
      ...INITIAL_GAME_STATE,
      mode,
      crop,
      soilType,
      outcomeData: {
        ...INITIAL_GAME_STATE.outcomeData,
        targetYield: crop === 'rice' ? 6.0 : crop === 'maize' ? 8.0 : 4.5
      }
    })
    setShowSetup(false)
    
    toast({
      title: `${scenario.title} Started`,
      description: scenario.description
    })
  }

  const resetSimulation = () => {
    setGameState(INITIAL_GAME_STATE)
    setShowSetup(true)
  }

  const togglePlayPause = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const handleWeekChange = (week: number) => {
    setGameState(prev => ({ ...prev, currentWeek: week }))
  }

  const handleSpeedChange = (speed: number) => {
    setGameState(prev => ({ ...prev, playbackSpeed: speed }))
  }

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center justify-center gap-3">
                <Globe className="h-8 w-8" />
                NASA Agricultural Simulator
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Use real NASA satellite data to make smart farming decisions
              </p>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(SCENARIOS).map(([key, scenario]) => (
              <Dialog key={key}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {key === 'sandbox' && <Sprout className="h-5 w-5" />}
                        {key === 'drought' && <Target className="h-5 w-5" />}
                        {key === 'monsoon' && <Trophy className="h-5 w-5" />}
                        {scenario.title}
                      </CardTitle>
                      <Badge variant="secondary">{scenario.duration} weeks</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {scenario.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Objectives:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {scenario.objectives.map((obj, i) => (
                            <li key={i}>• {obj}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{scenario.title}</DialogTitle>
                    <DialogDescription>{scenario.description}</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Crop:</label>
                      <Select defaultValue="wheat">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wheat">Wheat</SelectItem>
                          <SelectItem value="rice">Rice</SelectItem>
                          <SelectItem value="maize">Maize</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Soil Type:</label>
                      <Select defaultValue="loam">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clay">Clay (high retention)</SelectItem>
                          <SelectItem value="loam">Loam (balanced)</SelectItem>
                          <SelectItem value="sandy">Sandy (fast drainage)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={() => startNewSimulation(key as GameState['mode'], 'wheat', 'loam')}
                      className="w-full"
                    >
                      Start {scenario.title}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const scenario = SCENARIOS[gameState.mode]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">{scenario.title}</h1>
                <Badge variant="secondary">Week {gameState.currentWeek}/{scenario.duration}</Badge>
                <Badge variant="outline">{gameState.crop} • {gameState.soilType} soil</Badge>
                {gameState.location && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {gameState.location.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetSimulation}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Game
                </Button>
                <Button 
                  variant={gameState.isPlaying ? "secondary" : "default"}
                  size="sm"
                  onClick={togglePlayPause}
                >
                  {gameState.isPlaying ? (
                    <><Pause className="h-4 w-4 mr-2" />Pause</>
                  ) : (
                    <><Play className="h-4 w-4 mr-2" />Play</>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map Panel */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  NASA Satellite View
                </CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <AgricultureMap 
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={gameState.location}
                />
              </CardContent>
            </Card>

            <SimulationTimeline
              currentWeek={gameState.currentWeek}
              totalWeeks={scenario.duration}
              onWeekChange={handleWeekChange}
              isPlaying={gameState.isPlaying}
              onPlayPause={togglePlayPause}
              playbackSpeed={gameState.playbackSpeed}
              onSpeedChange={handleSpeedChange}
            />
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            <DecisionsPanel
              currentWeek={gameState.currentWeek}
              onDecisionMake={handleDecisionMake}
              pastDecisions={gameState.decisions}
              budget={gameState.budget}
            />
          </div>
        </div>

        {/* Outcomes Panel */}
        <OutcomesPanel
          data={gameState.outcomeData}
          currentWeek={gameState.currentWeek}
          scenario={gameState.mode}
        />

        {/* Coach Tips */}
        <CoachTips
          currentWeek={gameState.currentWeek}
          gameData={{
            soilMoisture: gameState.outcomeData.soilMoisture,
            weatherForecast: gameState.weatherForecast,
            recentDecisions: gameState.decisions.slice(-3),
            performance: {
              yield: gameState.outcomeData.yield / gameState.outcomeData.targetYield,
              efficiency: (100 - gameState.outcomeData.etGap) / 100
            }
          }}
        />
      </div>
    </div>
  )
}