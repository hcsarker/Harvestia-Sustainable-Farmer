import { useEffect, useMemo, useState } from 'react'
import { useAchievements } from '@/hooks/useAchievements'
import { useUserProgress } from '@/hooks/useUserProgress'
import { useLocalWeather } from '@/hooks/useLocalWeather'
import { useNASAData } from '@/hooks/useNASAData'
import { useAuth } from '@/hooks/useAuth'

type MoisturePoint = { date: string; moisture_percent?: number | null }

export function useDashboardStats() {
  const { earnedIds, certCount } = useAchievements()
  const { courseProgress, storyProgress } = useUserProgress()
  const { series, coords } = useLocalWeather()
  const { fetchSMAPData, fetchMODISData, fetchGPMData } = useNASAData()
  const { profile } = useAuth()

  const [avgSoilMoisture, setAvgSoilMoisture] = useState<number | null>(null)
  const [avgNDVI, setAvgNDVI] = useState<number | null>(null)
  const [recentRain, setRecentRain] = useState<number | null>(null)

  // Fetch SMAP soil moisture summary for efficiency calc
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const locStr = coords ? `lat=${coords.lat.toFixed(3)},lon=${coords.lon.toFixed(3)}` : 'unknown'
      const data = await fetchSMAPData(locStr) as { data?: { soil_moisture_levels?: MoisturePoint[] } } | null
      if (cancelled) return
      const arr = data?.data?.soil_moisture_levels
      if (arr && arr.length) {
        const last7 = arr.slice(-7)
        const vals = last7.map(p => (typeof p.moisture_percent === 'number' && p.moisture_percent > -900) ? p.moisture_percent : null).filter((v): v is number => v != null)
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
        setAvgSoilMoisture(avg)
      }
    }
    run()
    return () => { cancelled = true }
  }, [coords, fetchSMAPData])

  // Fetch MODIS NDVI average and GPM rainfall (last 7 days) to enrich condition score
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!coords) return
      // MODIS NDVI (mocked via edge or synthetic in dev)
      try {
        const ndviRes = await fetchMODISData(`${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`) as { data?: { ndvi_values?: { date: string; ndvi: number }[], average_ndvi?: number } } | null
        if (!cancelled) {
          const vals = ndviRes?.data?.ndvi_values?.slice(-7).map(v => (typeof v.ndvi === 'number' ? v.ndvi : null)).filter((v): v is number => v != null) || []
          const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : (typeof ndviRes?.data?.average_ndvi === 'number' ? ndviRes.data.average_ndvi : null)
          setAvgNDVI(avg ?? null)
        }
      } catch { /* ignore */ }
      // GPM precipitation (mm) last 7 days sum
      try {
        const gpmRes = await fetchGPMData(coords.lat, coords.lon) as { data?: { precipitation_data?: { date: string; precipitation_mm: number }[] } } | null
        if (!cancelled) {
          const arr = gpmRes?.data?.precipitation_data || []
          const last7 = arr.slice(-7)
          const sum = last7.map(p => (typeof p.precipitation_mm === 'number' ? p.precipitation_mm : 0)).reduce((a,b)=>a+b,0)
          setRecentRain(sum)
        }
      } catch { /* ignore */ }
    }
    run()
    return () => { cancelled = true }
  }, [coords, fetchMODISData, fetchGPMData])

  const achievementsCount = earnedIds.size

  // Heuristic: use whichever progress list is larger as a proxy for number of entities tracked
  const fieldsMonitored = Math.max(storyProgress.length, courseProgress.length)

  // Water efficiency: closeness of avg soil moisture to ideal 30%, linear penalty
  const waterEfficiency = useMemo(() => {
    if (avgSoilMoisture == null) return null
    const ideal = 30
    const penalty = Math.abs(avgSoilMoisture - ideal) * 3 // 10% off -> 70%
    const eff = Math.max(0, Math.min(100, 100 - penalty))
    return Math.round(eff)
  }, [avgSoilMoisture])

  // Sustainability score: combine achievements, completed courses and certificates; add solar contribution if available
  const sustainabilityScore = useMemo(() => {
    const completedCourses = courseProgress.filter(c => c.completed).length
    const achScore = achievementsCount * 100
    const courseScore = completedCourses * 120
    const certScore = certCount * 150
    let solarScore = 0
    if (series && series.length) {
      const last7 = series.slice(-7)
      const solarVals = last7.map(d => (typeof d.ALLSKY_SFC_SW_DWN === 'number' && d.ALLSKY_SFC_SW_DWN > -900) ? d.ALLSKY_SFC_SW_DWN : null).filter((v): v is number => v != null)
      const avgSolar = solarVals.length ? solarVals.reduce((a, b) => a + b, 0) / solarVals.length : 0
      solarScore = Math.round(avgSolar * 10)
    }
    return achScore + courseScore + certScore + solarScore
  }, [achievementsCount, courseProgress, certCount, series])

  // Compute environmental condition score from NASA POWER last 7 days (sanitized by useLocalWeather) + SMAP moisture
  const conditionsScore = useMemo(() => {
    if (!series || series.length === 0) return null
    const last = series[series.length - 1]
    const clamp = (x: number, a = 0, b = 100) => Math.max(a, Math.min(b, x))
    // Temperature ideal ~24°C
    const t = typeof last.T2M === 'number' ? last.T2M : null
    const tempScore = t == null ? null : clamp(100 - Math.abs(t - 24) * 6) // 5°C off -> 70
    // Humidity ideal ~55%
    const h = typeof last.RH2M === 'number' ? last.RH2M : null
    const humScore = h == null ? null : clamp(100 - Math.abs(h - 55) * 1.2)
    // Wind ideal ~3 m/s (too high or too low worse)
    const w = typeof last.WS2M === 'number' ? last.WS2M : null
    const windScore = w == null ? null : clamp(100 - Math.abs(w - 3) * 18) // 2 m/s off -> 64
    // Solar: normalize 0-8 kWh/m2/day
    const s = typeof last.ALLSKY_SFC_SW_DWN === 'number' ? last.ALLSKY_SFC_SW_DWN : null
    const solarScore = s == null ? null : clamp((s / 8) * 100)
    // Moisture ideal ~30%
    const moist = avgSoilMoisture
    const moistureScore = moist == null ? null : clamp(100 - Math.abs(moist - 30) * 3)
    // NDVI (0-1) → 0-100; prefer 0.5-0.8 as good
    const ndvi = typeof avgNDVI === 'number' ? avgNDVI : null
    const ndviScore = ndvi == null ? null : clamp((ndvi - 0.3) / (0.8 - 0.3) * 100)
    // Rainfall: 10–50 mm last 7 days ideal range
    const rain = typeof recentRain === 'number' ? recentRain : null
    const rainScore = rain == null ? null : clamp(100 - Math.abs((rain - 30)) * 2) // 30mm ideal
    const parts = [tempScore, humScore, windScore, solarScore, moistureScore, ndviScore, rainScore].filter((x): x is number => x != null)
    if (!parts.length) return null
    return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
  }, [series, avgSoilMoisture, avgNDVI, recentRain])

  // Activity score from profile level/XP, achievements, completed courses
  const activityScore = useMemo(() => {
    const level = profile?.level ?? 1
    const xp = profile?.experience_points ?? 0
    const completedCourses = courseProgress.filter(c => c.completed).length
    const ach = achievementsCount
    // Normalize XP within current level bracket roughly
    const nextLevelXP = Math.max(100, level * 200)
    const xpPct = Math.min(1, xp / nextLevelXP)
    const levelScore = Math.min(100, level * 10)
    const xpScore = Math.round(xpPct * 100)
    const courseScore = Math.min(100, completedCourses * 12)
    const achScore = Math.min(100, ach * 15)
    return Math.round((levelScore * 0.35) + (xpScore * 0.25) + (courseScore * 0.2) + (achScore * 0.2))
  }, [profile?.level, profile?.experience_points, courseProgress, achievementsCount])

  // Farm Health combines conditions (60%) and activity (40%)
  const farmHealth = useMemo(() => {
    if (conditionsScore == null) return Math.round(activityScore * 0.6) // when env missing, lean on activity
    return Math.round(conditionsScore * 0.6 + activityScore * 0.4)
  }, [conditionsScore, activityScore])

  return {
    achievementsCount,
    fieldsMonitored,
    waterEfficiency,
    sustainabilityScore,
    conditionsScore,
    farmHealth,
  }
}
