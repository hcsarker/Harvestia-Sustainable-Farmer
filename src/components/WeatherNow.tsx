import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLocalWeather } from '@/hooks/useLocalWeather'
import { Loader2, MapPin, Sun, Wind, Thermometer, Droplets } from 'lucide-react'

export const WeatherNow: React.FC = () => {
  const { coords, last, loading, error } = useLocalWeather()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Local Conditions (NASA POWER)
          {coords && (
            <Badge variant="outline" className="ml-1 text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {coords.lat.toFixed(2)}, {coords.lon.toFixed(2)}
            </Badge>
          )}
          {loading && <Badge variant="secondary" className="ml-2"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading</Badge>}
          {error && <Badge variant="destructive" className="ml-2">{String(error)}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!last ? (
          <div className="text-sm text-muted-foreground">Waiting for location and data…</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-md border flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-xs text-muted-foreground">Air Temp</div>
                <div className="font-medium">{last.T2M ?? '—'} °C</div>
              </div>
            </div>
            <div className="p-3 rounded-md border flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-xs text-muted-foreground">Humidity</div>
                <div className="font-medium">{last.RH2M ?? '—'} %</div>
              </div>
            </div>
            <div className="p-3 rounded-md border flex items-center gap-2">
              <Wind className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-xs text-muted-foreground">Wind</div>
                <div className="font-medium">{last.WS2M ?? '—'} m/s</div>
              </div>
            </div>
            <div className="p-3 rounded-md border flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-xs text-muted-foreground">Solar</div>
                <div className="font-medium">{last.ALLSKY_SFC_SW_DWN ?? '—'} kWh/m²/day</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WeatherNow
