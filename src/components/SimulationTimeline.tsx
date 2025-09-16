import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, SkipForward, SkipBack, Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeekData {
  week: number
  date: string
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter'
  weather: 'Sunny' | 'Rainy' | 'Cloudy' | 'Drought' | 'Storm'
  cropStage: string
  events: string[]
}

interface SimulationTimelineProps {
  currentWeek: number
  totalWeeks: number
  onWeekChange: (week: number) => void
  isPlaying: boolean
  onPlayPause: () => void
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
  weekData?: WeekData[]
}

const SAMPLE_WEEKS: WeekData[] = Array.from({ length: 52 }, (_, i) => {
  const week = i + 1
  const date = new Date(2024, 0, 1 + (week - 1) * 7)
  const month = date.getMonth()
  
  let season: WeekData['season']
  if (month >= 2 && month <= 4) season = 'Spring'
  else if (month >= 5 && month <= 7) season = 'Summer'  
  else if (month >= 8 && month <= 10) season = 'Fall'
  else season = 'Winter'

  const weathers: WeekData['weather'][] = ['Sunny', 'Rainy', 'Cloudy', 'Drought', 'Storm']
  const weather = weathers[Math.floor(Math.random() * weathers.length)]
  
  const cropStages = ['Planting', 'Germination', 'Vegetative', 'Flowering', 'Fruit Development', 'Maturity', 'Harvest', 'Fallow']
  const cropStage = cropStages[Math.floor((week - 1) / 7) % cropStages.length]

  const possibleEvents = [
    'Irrigation scheduled',
    'Fertilizer application',
    'Pest monitoring',
    'Weather alert',
    'Harvest window'
  ]
  const events = Math.random() > 0.7 ? [possibleEvents[Math.floor(Math.random() * possibleEvents.length)]] : []

  return {
    week,
    date: date.toLocaleDateString(),
    season,
    weather,
    cropStage,
    events
  }
})

const PLAYBACK_SPEEDS = [0.5, 1, 2, 4, 8]

export const SimulationTimeline: React.FC<SimulationTimelineProps> = ({
  currentWeek,
  totalWeeks,
  onWeekChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange,
  weekData = SAMPLE_WEEKS.slice(0, totalWeeks)
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const currentWeekData = weekData[currentWeek - 1]
  const progress = (currentWeek / totalWeeks) * 100

  const handleSliderChange = useCallback((value: number[]) => {
    if (!isPlaying) {
      onWeekChange(value[0])
    }
  }, [isPlaying, onWeekChange])

  const handleSliderDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleSliderDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const skipBackward = useCallback(() => {
    onWeekChange(Math.max(1, currentWeek - 4))
  }, [currentWeek, onWeekChange])

  const skipForward = useCallback(() => {
    onWeekChange(Math.min(totalWeeks, currentWeek + 4))
  }, [currentWeek, totalWeeks, onWeekChange])

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'Spring': return 'hsl(var(--primary))'
      case 'Summer': return 'hsl(var(--accent))'
      case 'Fall': return 'hsl(var(--secondary))'
      case 'Winter': return 'hsl(var(--muted))'
      default: return 'hsl(var(--muted))'
    }
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Sunny': return '☀️'
      case 'Rainy': return '🌧️'
      case 'Cloudy': return '☁️'
      case 'Drought': return '🌵'
      case 'Storm': return '⛈️'
      default: return '🌤️'
    }
  }

  return (
    <Card className="w-full bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Simulation Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={skipBackward}
            disabled={currentWeek <= 1}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isPlaying ? "secondary" : "default"}
            size="sm"
            onClick={onPlayPause}
            className="min-w-[80px]"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={skipForward}
            disabled={currentWeek >= totalWeeks}
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Speed:</span>
            <div className="flex gap-1">
              {PLAYBACK_SPEEDS.map(speed => (
                <Button
                  key={speed}
                  variant={playbackSpeed === speed ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onSpeedChange(speed)}
                  className="h-8 w-8 p-0"
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Week {currentWeek} of {totalWeeks}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          
          <div className="relative">
            <Slider
              value={[currentWeek]}
              max={totalWeeks}
              min={1}
              step={1}
              onValueChange={handleSliderChange}
              onValueCommit={handleSliderDragEnd}
              disabled={isPlaying}
              className={cn(
                "w-full",
                isPlaying && "opacity-50 cursor-not-allowed"
              )}
            />
            
            {/* Week markers */}
            <div className="flex justify-between mt-1 px-3">
              {Array.from({ length: Math.min(13, totalWeeks) }, (_, i) => {
                const weekNum = Math.floor((i / 12) * totalWeeks) + 1
                return (
                  <div key={i} className="text-xs text-muted-foreground">
                    {weekNum}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Current Week Info */}
        {currentWeekData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Date</span>
              </div>
              <p className="text-sm text-muted-foreground">{currentWeekData.date}</p>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: getSeasonColor(currentWeekData.season) + '20' }}
                >
                  {currentWeekData.season}
                </Badge>
                <Badge variant="outline">
                  {getWeatherIcon(currentWeekData.weather)} {currentWeekData.weather}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Crop Stage</h4>
              <p className="text-sm text-muted-foreground">{currentWeekData.cropStage}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Events</h4>
              {currentWeekData.events.length > 0 ? (
                <div className="space-y-1">
                  {currentWeekData.events.map((event, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No events this week</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}