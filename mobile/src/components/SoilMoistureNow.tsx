import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNASAData } from '@/hooks/useNASAData'
import { Droplets, Loader2, MapPin } from 'lucide-react'

type MoisturePoint = { date: string; moisture_percent?: number | null }
type SMAPResponse = { data?: { soil_moisture_levels?: MoisturePoint[] } }

export const SoilMoistureNow: React.FC = () => {
  const { fetchSMAPData, loading, error } = useNASAData()
  const [coords, setCoords] = React.useState<{ lat: number; lon: number } | null>(null)
  const [last, setLast] = React.useState<MoisturePoint | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const detect = async () => {
      const getGeo = () => new Promise<{ lat: number; lon: number } | null>((resolve) => {
        if (!navigator.geolocation) return resolve(null)
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: false, timeout: 5000 }
        )
      })
      const geo = await getGeo()
      if (geo) {
        if (!cancelled) setCoords(geo)
        return
      }
      // Fallback to IP
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (res.ok) {
          const j = await res.json() as { latitude?: number; longitude?: number }
          if (typeof j.latitude === 'number' && typeof j.longitude === 'number') {
            if (!cancelled) setCoords({ lat: j.latitude, lon: j.longitude })
          }
        }
      } catch { /* noop */ }
    }
    detect()
    return () => { cancelled = true }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      const locStr = coords ? `lat=${coords.lat.toFixed(3)},lon=${coords.lon.toFixed(3)}` : 'unknown'
      const data = await fetchSMAPData(locStr) as SMAPResponse | null
      if (cancelled) return
      const arr = data?.data?.soil_moisture_levels
      if (arr && arr.length > 0) setLast(arr[arr.length - 1])
    }
    run()
    return () => { cancelled = true }
  }, [coords, fetchSMAPData])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Soil Moisture (SMAP)
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
          <div className="text-sm text-muted-foreground">Gathering SMAP data…</div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-md border w-fit">
            <Droplets className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-xs text-muted-foreground">Topsoil Moisture</div>
              <div className="font-semibold">{last.moisture_percent?.toFixed?.(1) ?? last.moisture_percent ?? '—'}%</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SoilMoistureNow
