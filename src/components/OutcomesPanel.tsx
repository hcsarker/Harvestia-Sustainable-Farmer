import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Droplets, 
  Leaf, 
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OutcomeData {
  yield: number
  targetYield: number
  soilMoisture: number
  etGap: number
  nitrogenLeached: number
  totalScore: number
  weeklyData: Array<{
    week: number
    yield: number
    moisture: number
    et: number
    nitrogen: number
  }>
  costs: {
    irrigation: number
    fertilizer: number
    total: number
  }
  revenue: number
  profit: number
}

interface OutcomesPanelProps {
  data: OutcomeData
  currentWeek: number
  scenario?: 'drought' | 'monsoon' | 'normal' | 'sandbox'
}

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))'
}

export const OutcomesPanel: React.FC<OutcomesPanelProps> = ({
  data,
  currentWeek,
  scenario = 'normal'
}) => {
  const yieldProgress = Math.min((data.yield / data.targetYield) * 100, 100)
  const moistureHealth = data.soilMoisture > 20 ? 'optimal' : data.soilMoisture > 10 ? 'adequate' : 'low'
  const etEfficiency = data.etGap < 20 ? 'excellent' : data.etGap < 40 ? 'good' : 'poor'
  const leachingRisk = data.nitrogenLeached < 10 ? 'low' : data.nitrogenLeached < 25 ? 'medium' : 'high'

  const getHealthColor = (level: string) => {
    switch (level) {
      case 'excellent':
      case 'optimal':
      case 'low': return 'hsl(var(--primary))'
      case 'good':
      case 'adequate':
      case 'medium': return 'hsl(var(--secondary))'
      case 'poor':
      case 'high': return 'hsl(var(--destructive))'
      default: return 'hsl(var(--muted))'
    }
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'hsl(var(--primary))' }
    if (score >= 80) return { grade: 'A', color: 'hsl(var(--primary))' }
    if (score >= 70) return { grade: 'B', color: 'hsl(var(--secondary))' }
    if (score >= 60) return { grade: 'C', color: 'hsl(var(--accent))' }
    return { grade: 'D', color: 'hsl(var(--destructive))' }
  }

  const scoreGrade = getScoreGrade(data.totalScore)

  // Prepare data for charts
  const weeklyTrendData = data.weeklyData.slice(0, currentWeek)
  
  const performanceData = [
    { name: 'Yield', value: data.yield, target: data.targetYield, color: CHART_COLORS.primary },
    { name: 'Soil Moisture', value: data.soilMoisture, target: 30, color: CHART_COLORS.secondary },
    { name: 'Water Use Efficiency', value: 100 - data.etGap, target: 80, color: CHART_COLORS.accent }
  ]

  const financialData = [
    { name: 'Revenue', value: data.revenue, color: CHART_COLORS.primary },
    { name: 'Irrigation Cost', value: -data.costs.irrigation, color: CHART_COLORS.secondary },
    { name: 'Fertilizer Cost', value: -data.costs.fertilizer, color: CHART_COLORS.accent },
    { name: 'Net Profit', value: data.profit, color: data.profit > 0 ? CHART_COLORS.primary : 'hsl(var(--destructive))' }
  ]

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <Card className="bg-background/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Dashboard
            </span>
            <Badge 
              variant="secondary"
              className="text-lg px-3 py-1"
              style={{ backgroundColor: scoreGrade.color + '20', color: scoreGrade.color }}
            >
              Grade: {scoreGrade.grade}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Gauge */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold" style={{ color: scoreGrade.color }}>
              {data.totalScore}%
            </div>
            <p className="text-sm text-muted-foreground">Overall Farm Score</p>
            <Progress value={data.totalScore} className="w-full h-3" />
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Yield Progress</span>
              </div>
              <div className="text-2xl font-bold">
                {data.yield.toFixed(1)}t/ha
              </div>
              <Progress value={yieldProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Target: {data.targetYield}t/ha ({yieldProgress.toFixed(0)}%)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4" style={{ color: getHealthColor(moistureHealth) }} />
                <span className="text-sm font-medium">Soil Moisture</span>
              </div>
              <div className="text-2xl font-bold">
                {data.soilMoisture.toFixed(1)}%
              </div>
              <Badge 
                variant="secondary"
                style={{ backgroundColor: getHealthColor(moistureHealth) + '20' }}
              >
                {moistureHealth.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: getHealthColor(etEfficiency) }} />
                <span className="text-sm font-medium">Water Efficiency</span>
              </div>
              <div className="text-2xl font-bold">
                {(100 - data.etGap).toFixed(0)}%
              </div>
              <Badge 
                variant="secondary"
                style={{ backgroundColor: getHealthColor(etEfficiency) + '20' }}
              >
                {etEfficiency.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Profit</span>
              </div>
              <div className={cn(
                "text-2xl font-bold",
                data.profit > 0 ? "text-primary" : "text-destructive"
              )}>
                ${data.profit.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                {data.profit > 0 ? (
                  <TrendingUp className="h-3 w-3 text-primary" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className="text-xs text-muted-foreground">
                  Revenue: ${data.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-background/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="yield" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={2}
                  name="Yield (t/ha)"
                />
                <Line 
                  type="monotone" 
                  dataKey="moisture" 
                  stroke={CHART_COLORS.secondary} 
                  strokeWidth={2}
                  name="Soil Moisture (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-background/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="value" fill={CHART_COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact */}
      <Card className="bg-background/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Nitrogen Leaching Risk</h4>
              <div className="text-xl font-bold" style={{ color: getHealthColor(leachingRisk) }}>
                {data.nitrogenLeached.toFixed(1)}%
              </div>
              <Badge 
                variant="secondary"
                style={{ backgroundColor: getHealthColor(leachingRisk) + '20' }}
              >
                {leachingRisk.toUpperCase()} RISK
              </Badge>
              <p className="text-xs text-muted-foreground">
                Optimal: &lt;10%, Critical: &gt;25%
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Water Conservation</h4>
              <div className="text-xl font-bold text-primary">
                {((1 - data.etGap / 100) * 100).toFixed(0)}%
              </div>
              <Badge variant="secondary">
                {data.costs.irrigation < 1000 ? 'EFFICIENT' : 'HIGH USE'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Total irrigation cost: ${data.costs.irrigation}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Sustainability Score</h4>
              <div className="text-xl font-bold text-primary">
                {Math.max(0, 100 - data.nitrogenLeached - (data.etGap / 2)).toFixed(0)}%
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Balanced approach
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}