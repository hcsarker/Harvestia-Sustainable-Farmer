import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

type NASADataType = 'MODIS' | 'VIIRS' | 'SMAP' | 'ECOSTRESS' | 'GPM_IMERG' | 'MERRA2' | 'NASA_POWER' | 'GIBS' | 'GISS' | 'OCO-2' | 'Landsat'

interface NASADataRequest {
  dataType: NASADataType
  location?: string
  latitude?: number
  longitude?: number
  startDate?: string
  endDate?: string
  parameters?: string[]
}

export const useNASAData = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchNASAData = useCallback(async (request: NASADataRequest) => {
    setLoading(true)
    setError(null)

    try {
      // Local dev fallback: if Supabase env is missing in dev, return synthetic data
      const noEnv = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
      if (import.meta.env.DEV && noEnv) {
        // Minimal synthetic payload resembling edge responses
        const now = new Date()
        const days = Array.from({ length: 7 }, (_, i) => new Date(now.getTime() - (6 - i) * 86400000).toISOString().slice(0, 10))
        const type = request.dataType
        if (type === 'NASA_POWER') {
          const latitude = request.latitude
          const longitude = request.longitude
          const params = (request.parameters && request.parameters.length ? request.parameters : ['T2M','RH2M','WS2M','ALLSKY_SFC_SW_DWN'])
          // Try real NASA POWER fetch directly from the browser; fall back to synthetic on error
          if (typeof latitude === 'number' && typeof longitude === 'number') {
            try {
              const toYMD = (d: Date) => `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`
              const end = new Date()
              const start = new Date(end.getTime() - 29 * 86400000)
              const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${encodeURIComponent(params.join(','))}&community=AG&longitude=${longitude}&latitude=${latitude}&start=${toYMD(start)}&end=${toYMD(end)}&format=JSON`
              const resp = await fetch(url, { headers: { 'Accept': 'application/json' } })
              if (resp.ok) {
                const json = await resp.json() as { properties?: { parameter?: Record<string, Record<string, number>> } }
                const root = json.properties?.parameter || {}
                const sampleKey = Object.keys(root)[0]
                const dateKeys = sampleKey ? Object.keys(root[sampleKey]) : []
                const daily_data = dateKeys.map(k => {
                  const dateISO = `${k.slice(0,4)}-${k.slice(4,6)}-${k.slice(6,8)}`
                  const entry: Record<string, number | string | null> = { date: dateISO }
                  for (const p of params) entry[p] = root[p]?.[k] ?? null
                  return entry
                })
                return { type: 'NASA_POWER_Agro', latitude, longitude, timestamp: new Date().toISOString(), parameters: params, data: { daily_data } }
              }
            } catch {
              // ignore and fall through to synthetic
            }
          }
          // Synthetic NASA_POWER payload
          const daily_data = days.map((d) => ({
            date: d,
            T2M: 22 + Math.random() * 8,
            RH2M: 50 + Math.random() * 30,
            WS2M: 0.5 + Math.random() * 4,
            ALLSKY_SFC_SW_DWN: 3 + Math.random() * 5
          }))
          return { type: 'NASA_POWER_Agro', latitude: request.latitude ?? 0, longitude: request.longitude ?? 0, timestamp: new Date().toISOString(), parameters: params, data: { daily_data } }
        }
        const mock = {
          timestamp: new Date().toISOString(),
          data:
            type === 'MODIS' ? { ndvi_values: days.map(d => ({ date: d, ndvi: 0.4 + Math.random() * 0.3 })), average_ndvi: 0.55, crop_health_score: 78 } :
            type === 'SMAP' ? { soil_moisture_levels: days.map(d => ({ date: d, moisture_percent: 20 + Math.random() * 15 })), average_moisture: 28, drought_risk: 'Low' } :
            type === 'GISS' ? { temperature_data: days.map(d => ({ date: d, temp_celsius: 18 + Math.random() * 10 })), climate_trend: 'Warming', frost_risk: 'Low' } :
            type === 'OCO-2' ? { co2_levels: days.map(d => ({ date: d, co2_ppm: 410 + Math.random() * 10 })), carbon_sequestration_rate: 3.1, sustainability_score: 72 } :
            type === 'Landsat' ? { land_classification: { cropland: 70, forest: 12, grassland: 10, urban: 6, water: 2 }, land_health_index: 81 } :
            { sample: true }
        }
        return mock
      }

      // Cache-first (DB) strategy to avoid unnecessary edge function invocations
      // Build cache key same as edge function
      const type = request.dataType
      let cacheLocationKey = request.location ?? 'global'
      if (type === 'NASA_POWER') {
        const now = new Date()
        const endD = request.endDate ? new Date(request.endDate) : now
        const startD = request.startDate ? new Date(request.startDate) : new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
        const toYMD = (d: Date) => `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`
        const DEFAULT_PARAMS = ['T2M','RH2M','WS2M','ALLSKY_SFC_SW_DWN']
        const params = (request.parameters && request.parameters.length ? request.parameters : DEFAULT_PARAMS)
        cacheLocationKey = `lat=${request.latitude},lon=${request.longitude},start=${toYMD(startD)},end=${toYMD(endD)},params=${params.join(',')}`
      }

      // Try to read fresh cache directly
      try {
        const { data: cached } = await supabase
          .from('nasa_data_cache')
          .select('data, expires_at')
          .eq('data_type', type)
          .eq('location', cacheLocationKey)
          .gte('expires_at', new Date().toISOString())
          .single()
        if (cached?.data) {
          return cached.data as unknown
        }
      } catch {
        // ignore cache read failures; continue to edge function
      }

      const { data, error } = await supabase.functions.invoke('nasa-data', {
        body: request
      })

      if (error) {
        throw error
      }

      // If NASA_POWER came back empty, try a direct browser fetch as a fallback
      if (request.dataType === 'NASA_POWER') {
        const latitude = request.latitude
        const longitude = request.longitude
        const params = (request.parameters && request.parameters.length ? request.parameters : ['T2M','RH2M','WS2M','ALLSKY_SFC_SW_DWN'])
        type PowerResp = { data?: { daily_data?: unknown[] } }
        const arr = (data as PowerResp | null | undefined)?.data?.daily_data
        const needsFallback = !Array.isArray(arr) || arr.length === 0
        if (needsFallback && typeof latitude === 'number' && typeof longitude === 'number') {
          try {
            const toYMD = (d: Date) => `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`
            const end = new Date()
            const start = new Date(end.getTime() - 29 * 86400000)
            const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${encodeURIComponent(params.join(','))}&community=AG&longitude=${longitude}&latitude=${latitude}&start=${toYMD(start)}&end=${toYMD(end)}&format=JSON`
            const resp = await fetch(url, { headers: { 'Accept': 'application/json' } })
            if (resp.ok) {
              const json = await resp.json() as { properties?: { parameter?: Record<string, Record<string, number>> } }
              const root = json.properties?.parameter || {}
              const sampleKey = Object.keys(root)[0]
              const dateKeys = sampleKey ? Object.keys(root[sampleKey]) : []
              const daily_data = dateKeys.map(k => {
                const dateISO = `${k.slice(0,4)}-${k.slice(4,6)}-${k.slice(6,8)}`
                const entry: Record<string, number | string | null> = { date: dateISO }
                for (const p of params) entry[p] = root[p]?.[k] ?? null
                return entry
              })
              return { type: 'NASA_POWER_Agro', latitude, longitude, timestamp: new Date().toISOString(), parameters: params, data: { daily_data } }
            }
          } catch {
            // ignore; fallback failed, return original data below
          }
        }
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NASA data'
      setError(errorMessage)
      if (!import.meta.env.DEV) {
        toast({
          title: "NASA Data Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchMODISData = useCallback((location?: string) => 
    fetchNASAData({ dataType: 'MODIS', location }), [fetchNASAData])
  
  const fetchSMAPData = useCallback((location?: string) => 
    fetchNASAData({ dataType: 'SMAP', location }), [fetchNASAData])
  
  const fetchGISSData = useCallback((location?: string) => 
    fetchNASAData({ dataType: 'GISS', location }), [fetchNASAData])
  
  const fetchOCO2Data = useCallback((location?: string) => 
    fetchNASAData({ dataType: 'OCO-2', location }), [fetchNASAData])
  
  const fetchLandsatData = useCallback((location?: string) => 
    fetchNASAData({ dataType: 'Landsat', location }), [fetchNASAData])

  const fetchVIIRSData = useCallback((location?: string) => 
    fetchNASAData({ dataType: 'VIIRS', location }), [fetchNASAData])
  
  const fetchECOSTRESSData = useCallback((latitude?: number, longitude?: number) => 
    fetchNASAData({ dataType: 'ECOSTRESS', latitude, longitude }), [fetchNASAData])
  
  const fetchGPMData = useCallback((latitude?: number, longitude?: number, location?: string) => 
    fetchNASAData({ dataType: 'GPM_IMERG', latitude, longitude, location }), [fetchNASAData])
  
  const fetchMERRA2Data = useCallback((latitude?: number, longitude?: number) => 
    fetchNASAData({ dataType: 'MERRA2', latitude, longitude }), [fetchNASAData])
  
  const fetchNASAPowerData = useCallback((latitude?: number, longitude?: number, parameters?: string[]) => 
    fetchNASAData({ dataType: 'NASA_POWER', latitude, longitude, parameters }), [fetchNASAData])
  
  const fetchGIBSData = useCallback((location?: string) => 
    fetchNASAData({ dataType: 'GIBS', location }), [fetchNASAData])

  return {
    loading,
    error,
    fetchNASAData,
    fetchMODISData,
    fetchSMAPData,
    fetchGISSData,
    fetchOCO2Data,
    fetchLandsatData,
    fetchVIIRSData,
    fetchECOSTRESSData,
    fetchGPMData,
    fetchMERRA2Data,
    fetchNASAPowerData,
    fetchGIBSData
  }
}