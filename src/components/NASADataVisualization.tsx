import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  Satellite, 
  Droplets, 
  ThermometerSun, 
  Leaf,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"
import { useNASAData } from "@/hooks/useNASAData"

interface NASADataVisualizationProps {
  dataType: 'MODIS' | 'SMAP' | 'GISS' | 'OCO-2' | 'Landsat'
  location?: string
  title: string
  description: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

const dataTypeConfig = {
  MODIS: { icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-100' },
  SMAP: { icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  GISS: { icon: ThermometerSun, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  'OCO-2': { icon: Satellite, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  Landsat: { icon: BarChart3, color: 'text-indigo-600', bgColor: 'bg-indigo-100' }
}

export default function NASADataVisualization({ 
  dataType, 
  location = 'global', 
  title, 
  description 
}: NASADataVisualizationProps) {
  const [nasaData, setNasaData] = useState<any>(null)
  const { fetchNASAData, loading, error } = useNASAData()

  const config = dataTypeConfig[dataType]
  const IconComponent = config.icon

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchNASAData({ dataType, location })
      setNasaData(data)
    }
    loadData()
  }, [dataType, location, fetchNASAData])

  const renderChart = () => {
    if (!nasaData?.data) return null

    switch (dataType) {
      case 'MODIS':
        return (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={nasaData.data.ndvi_values}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(nasaData.data.average_ndvi * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Vegetation Health</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {nasaData.data.crop_health_score.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Health Score</div>
              </div>
            </div>
          </div>
        )

      case 'SMAP':
        return (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={nasaData.data.soil_moisture_levels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="moisture_percent" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {nasaData.data.average_moisture.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Moisture</div>
              </div>
              <div className="text-center">
                <Badge variant={nasaData.data.drought_risk === 'High' ? 'destructive' : 'secondary'}>
                  {nasaData.data.drought_risk} Risk
                </Badge>
              </div>
            </div>
          </div>
        )

      case 'GISS':
        return (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={nasaData.data.temperature_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temp_celsius" stroke="#ea580c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  {nasaData.data.climate_trend === 'Warming' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : nasaData.data.climate_trend === 'Cooling' ? (
                    <TrendingDown className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="font-semibold">{nasaData.data.climate_trend}</span>
                </div>
                <div className="text-sm text-muted-foreground">Climate Trend</div>
              </div>
              <div className="text-center">
                <Badge variant={nasaData.data.frost_risk === 'High' ? 'destructive' : 'secondary'}>
                  {nasaData.data.frost_risk} Frost Risk
                </Badge>
              </div>
            </div>
          </div>
        )

      case 'OCO-2':
        return (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={nasaData.data.co2_levels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="co2_ppm" stroke="#7c3aed" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {nasaData.data.carbon_sequestration_rate.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Carbon Rate (t/ha/yr)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {nasaData.data.sustainability_score.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Sustainability Score</div>
              </div>
            </div>
          </div>
        )

      case 'Landsat':
        const landUseData = Object.entries(nasaData.data.land_classification).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value as number
        }))

        return (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={landUseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {landUseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {nasaData.data.land_health_index.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Land Health Index</div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <IconComponent className={`h-5 w-5 ${config.color}`} />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2">
              <span>{title}</span>
              <Badge variant="outline" className="text-xs">
                NASA {dataType}
              </Badge>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-[250px] w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!loading && !error && renderChart()}
        
        {!loading && !error && nasaData && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Data Location: {location}</span>
              <span>Last Updated: {new Date(nasaData.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}