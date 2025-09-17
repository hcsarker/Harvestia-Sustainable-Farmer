import React from 'react'
import { useNASAData } from '@/hooks/useNASAData'

export type LocalWeatherDay = {
  date: string
  T2M?: number | null
  RH2M?: number | null
  WS2M?: number | null
  ALLSKY_SFC_SW_DWN?: number | null
}

export function useLocalWeather() {
  const { fetchNASAPowerData, loading, error } = useNASAData()
  const [coords, setCoords] = React.useState<{ lat: number; lon: number } | null>(null)
  const [last, setLast] = React.useState<LocalWeatherDay | null>(null)
  const [series, setSeries] = React.useState<LocalWeatherDay[]>([])

  // Helper to sanitize NASA POWER fill values (-999, -9999)
  const sanitize = (v: number | null | undefined) => {
    if (v == null) return null
    if (v <= -900) return null
    return v
  }

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
      // IP fallback
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (res.ok) {
          const j = await res.json() as { latitude?: number; longitude?: number }
          if (typeof j.latitude === 'number' && typeof j.longitude === 'number') {
            if (!cancelled) setCoords({ lat: j.latitude, lon: j.longitude })
          }
        }
      } catch {
        // ignore
      }
    }
    detect()
    return () => { cancelled = true }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!coords) return
      const data = await fetchNASAPowerData(coords.lat, coords.lon, ['T2M','RH2M','WS2M','ALLSKY_SFC_SW_DWN'])
      if (cancelled) return
      const arr = data?.data?.daily_data as LocalWeatherDay[] | undefined
      if (arr && arr.length > 0) {
        // sanitize entire series
        const sanitized = arr.map(d => ({
          date: d.date,
          T2M: sanitize(d.T2M),
          RH2M: sanitize(d.RH2M),
          WS2M: sanitize(d.WS2M),
          ALLSKY_SFC_SW_DWN: sanitize(d.ALLSKY_SFC_SW_DWN),
        }))
        setSeries(sanitized)
        const lastRaw = sanitized[sanitized.length - 1]
        setLast({
          date: lastRaw.date,
          T2M: sanitize(lastRaw.T2M),
          RH2M: sanitize(lastRaw.RH2M),
          WS2M: sanitize(lastRaw.WS2M),
          ALLSKY_SFC_SW_DWN: sanitize(lastRaw.ALLSKY_SFC_SW_DWN),
        })
      }
    }
    run()
    return () => { cancelled = true }
  }, [coords, fetchNASAPowerData])

  return { coords, last, series, loading, error }
}
