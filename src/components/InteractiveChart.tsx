import { useState } from "react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieIcon, Activity } from "lucide-react"

interface InteractiveChartProps {
  title: string
  description?: string
  data: any[]
  type?: 'line' | 'bar' | 'pie'
  xKey: string
  yKey: string
  color?: string
  showControls?: boolean
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))',
  'hsl(var(--muted))',
]

export function InteractiveChart({
  title,
  description,
  data,
  type = 'line',
  xKey,
  yKey,
  color = 'hsl(var(--primary))',
  showControls = true
}: InteractiveChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>(type)
  const [hoveredData, setHoveredData] = useState<any>(null)

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey={xKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: 'white' }}
                onMouseEnter={(data) => setHoveredData(data)}
                onMouseLeave={() => setHoveredData(null)}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey={xKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              <Bar 
                dataKey={yKey} 
                fill={color}
                radius={[4, 4, 0, 0]}
                onMouseEnter={(data) => setHoveredData(data)}
                onMouseLeave={() => setHoveredData(null)}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill={color}
                dataKey={yKey}
                onMouseEnter={(data) => setHoveredData(data)}
                onMouseLeave={() => setHoveredData(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )
    }
  }

  const calculateTrend = () => {
    if (data.length < 2) return null
    const lastValue = data[data.length - 1][yKey]
    const previousValue = data[data.length - 2][yKey]
    const change = ((lastValue - previousValue) / previousValue) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    }
  }

  const trend = calculateTrend()

  return (
    <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {trend && (
            <Badge variant="secondary" className={`${
              trend.isPositive 
                ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' 
                : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
            }`}>
              {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {trend.value}%
            </Badge>
          )}
        </div>
        
        {showControls && (
          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              variant={chartType === 'line' ? 'default' : 'outline'}
              onClick={() => setChartType('line')}
            >
              <Activity className="h-4 w-4 mr-1" />
              Line
            </Button>
            <Button
              size="sm"
              variant={chartType === 'bar' ? 'default' : 'outline'}
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Bar
            </Button>
            <Button
              size="sm"
              variant={chartType === 'pie' ? 'default' : 'outline'}
              onClick={() => setChartType('pie')}
            >
              <PieIcon className="h-4 w-4 mr-1" />
              Pie
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {renderChart()}
          
          {hoveredData && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium">Data Point</div>
              <div className="text-xs text-muted-foreground">
                {xKey}: {hoveredData[xKey]} | {yKey}: {hoveredData[yKey]}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}