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
      const { data, error } = await supabase.functions.invoke('nasa-data', {
        body: request
      })

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NASA data'
      setError(errorMessage)
      toast({
        title: "NASA Data Error",
        description: errorMessage,
        variant: "destructive"
      })
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
  
  const fetchGPMData = useCallback((latitude?: number, longitude?: number) => 
    fetchNASAData({ dataType: 'GPM_IMERG', latitude, longitude }), [fetchNASAData])
  
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