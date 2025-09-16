import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CoachTip {
  id: string
  type: 'suggestion' | 'warning' | 'success' | 'info'
  title: string
  message: string
  actionable: boolean
  priority: 'high' | 'medium' | 'low'
  week: number
  triggers: string[]
}

interface CoachTipsProps {
  currentWeek: number
  gameData: {
    soilMoisture: number
    weatherForecast: string[]
    recentDecisions: any[]
    performance: {
      yield: number
      efficiency: number
    }
  }
  onTipDismiss?: (tipId: string) => void
  onTipAction?: (tipId: string, action: string) => void
}

export const CoachTips: React.FC<CoachTipsProps> = ({
  currentWeek,
  gameData,
  onTipDismiss,
  onTipAction
}) => {
  const [activeTips, setActiveTips] = useState<CoachTip[]>([])
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set())

  // Generate contextual tips based on game state
  useEffect(() => {
    const newTips: CoachTip[] = []

    // Soil moisture tips
    if (gameData.soilMoisture < 15) {
      newTips.push({
        id: `moisture-low-${currentWeek}`,
        type: 'warning',
        title: 'Low Soil Moisture Detected',
        message: 'Soil moisture is critically low. Consider immediate irrigation to prevent crop stress and yield loss.',
        actionable: true,
        priority: 'high',
        week: currentWeek,
        triggers: ['soil_moisture_low']
      })
    } else if (gameData.soilMoisture > 40) {
      newTips.push({
        id: `moisture-high-${currentWeek}`,
        type: 'suggestion',
        title: 'High Soil Moisture',
        message: 'Soil moisture is very high. You may want to delay irrigation and monitor for waterlogging risks.',
        actionable: true,
        priority: 'medium',
        week: currentWeek,
        triggers: ['soil_moisture_high']
      })
    }

    // Weather forecast tips
    const upcomingRain = gameData.weatherForecast.includes('Rainy') || gameData.weatherForecast.includes('Storm')
    if (upcomingRain) {
      newTips.push({
        id: `weather-rain-${currentWeek}`,
        type: 'info',
        title: 'Heavy Rain Forecasted',
        message: 'Rain is predicted in the coming days. Consider delaying nitrogen application by 1 week to avoid nutrient washout.',
        actionable: true,
        priority: 'medium',
        week: currentWeek,
        triggers: ['weather_rain_forecast']
      })
    }

    const drought = gameData.weatherForecast.includes('Drought')
    if (drought) {
      newTips.push({
        id: `weather-drought-${currentWeek}`,
        type: 'warning',
        title: 'Drought Conditions Expected',
        message: 'Extended dry period ahead. Switch to deficit irrigation strategy to conserve water while maintaining 80% yield target.',
        actionable: true,
        priority: 'high',
        week: currentWeek,
        triggers: ['weather_drought']
      })
    }

    // Performance-based tips
    if (gameData.performance.yield < 0.8) {
      newTips.push({
        id: `yield-low-${currentWeek}`,
        type: 'suggestion',
        title: 'Yield Below Target',
        message: 'Current yield projection is below 80% of target. Review your irrigation and fertilization strategy.',
        actionable: true,
        priority: 'high',
        week: currentWeek,
        triggers: ['low_yield_performance']
      })
    }

    if (gameData.performance.efficiency > 0.9) {
      newTips.push({
        id: `efficiency-excellent-${currentWeek}`,
        type: 'success',
        title: 'Excellent Water Efficiency!',
        message: 'Your water use efficiency is outstanding. This sustainable approach will benefit long-term soil health.',
        actionable: false,
        priority: 'low',
        week: currentWeek,
        triggers: ['high_efficiency']
      })
    }

    // Seasonal tips
    const season = Math.floor((currentWeek - 1) / 13)
    if (season === 1 && currentWeek % 13 === 1) { // Early summer
      newTips.push({
        id: `season-summer-${currentWeek}`,
        type: 'info',
        title: 'Summer Season Tips',
        message: 'Growing season is beginning. Focus on consistent moisture levels and split nitrogen applications for optimal growth.',
        actionable: true,
        priority: 'medium',
        week: currentWeek,
        triggers: ['season_summer_start']
      })
    }

    // Filter out dismissed tips and duplicates
    const filteredTips = newTips.filter(tip => 
      !dismissedTips.has(tip.id) && 
      !activeTips.some(activeTip => activeTip.id === tip.id)
    )

    setActiveTips(prev => [...prev, ...filteredTips].slice(-3)) // Keep only 3 most recent tips
  }, [currentWeek, gameData, dismissedTips, activeTips])

  const handleDismiss = (tipId: string) => {
    setActiveTips(prev => prev.filter(tip => tip.id !== tipId))
    setDismissedTips(prev => new Set([...prev, tipId]))
    onTipDismiss?.(tipId)
  }

  const handleAction = (tipId: string) => {
    // For demo purposes, we'll just dismiss the tip when action is taken
    handleDismiss(tipId)
    onTipAction?.(tipId, 'accept')
  }

  const getTypeIcon = (type: CoachTip['type']) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'info': return <TrendingUp className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: CoachTip['type']) => {
    switch (type) {
      case 'suggestion': return 'hsl(var(--primary))'
      case 'warning': return 'hsl(var(--destructive))'
      case 'success': return 'hsl(var(--primary))'
      case 'info': return 'hsl(var(--secondary))'
    }
  }

  const getPriorityBadge = (priority: CoachTip['priority']) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">High Priority</Badge>
      case 'medium': return <Badge variant="secondary" className="text-xs">Medium</Badge>
      case 'low': return <Badge variant="outline" className="text-xs">Info</Badge>
    }
  }

  if (activeTips.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {activeTips.map((tip, index) => (
        <Card
          key={tip.id}
          className={cn(
            "bg-background/95 backdrop-blur-sm border-l-4 shadow-lg animate-in slide-in-from-right-5",
            "transition-all duration-300 hover:shadow-xl"
          )}
          style={{ borderLeftColor: getTypeColor(tip.type) }}
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div style={{ color: getTypeColor(tip.type) }}>
                  {getTypeIcon(tip.type)}
                </div>
                <h4 className="text-sm font-semibold">{tip.title}</h4>
                {getPriorityBadge(tip.priority)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(tip.id)}
                className="h-6 w-6 p-0 hover:bg-muted/50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {tip.message}
            </p>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Week {tip.week}
              </div>
              
              {tip.actionable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(tip.id)}
                  className="h-7 text-xs px-2"
                  style={{ color: getTypeColor(tip.type) }}
                >
                  Apply Suggestion
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}