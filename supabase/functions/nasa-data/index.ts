// deno-lint-ignore-file no-explicit-any
// @ts-expect-error Deno global provided in edge runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Minimal declaration for local type-check (edge runtime provides Deno)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NASADataRequest {
  dataType: 'MODIS' | 'VIIRS' | 'SMAP' | 'ECOSTRESS' | 'GPM_IMERG' | 'MERRA2' | 'NASA_POWER' | 'GIBS' | 'GISS' | 'OCO-2' | 'Landsat'
  location?: string
  latitude?: number
  longitude?: number
  startDate?: string
  endDate?: string
  parameters?: string[]
}

interface NASAPowerArgs {
  latitude: number
  longitude: number
  startDate?: string
  endDate?: string
  parameters?: string[]
}

function toYMD(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

async function fetchNASAPower({ latitude, longitude, startDate, endDate, parameters }: NASAPowerArgs) {
  const DEFAULT_PARAMS = ['T2M', 'RH2M', 'WS2M', 'ALLSKY_SFC_SW_DWN']
  const params = (parameters && parameters.length ? parameters : DEFAULT_PARAMS).join(',')

  const now = new Date()
  const end = endDate ? new Date(endDate) : now
  const start = startDate ? new Date(startDate) : new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)

  const startYMD = toYMD(start)
  const endYMD = toYMD(end)

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${encodeURIComponent(params)}&community=AG&longitude=${longitude}&latitude=${latitude}&start=${startYMD}&end=${endYMD}&format=JSON`

  const resp = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`NASA POWER request failed (${resp.status}): ${text}`)
  }
  const json = await resp.json() as {
    properties?: { parameter?: Record<string, Record<string, number>> }
    parameters?: Record<string, Record<string, number>>
  }
  const paramRoot: Record<string, Record<string, number>> = (json.properties?.parameter) || (json.parameters ?? {})

  // Collect all date keys from the first parameter available
  const sampleParamKey = Object.keys(paramRoot)[0]
  const dateKeys = sampleParamKey ? Object.keys(paramRoot[sampleParamKey]) : []

  const daily_data = dateKeys.map((k: string) => {
    const dateISO = `${k.slice(0, 4)}-${k.slice(4, 6)}-${k.slice(6, 8)}`
    const entry: Record<string, number | null | string> = { date: dateISO }
    for (const p of (parameters && parameters.length ? parameters : DEFAULT_PARAMS)) {
      entry[p] = (paramRoot[p] && typeof paramRoot[p][k] !== 'undefined') ? paramRoot[p][k] : null
    }
    return entry
  })

  return {
    type: 'NASA_POWER_Agro',
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
    parameters: (parameters && parameters.length ? parameters : DEFAULT_PARAMS),
    data: { daily_data }
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Lightweight health check
    if (req.method === 'GET') {
      const hasUrl = Boolean(Deno.env.get('SUPABASE_URL'))
      const hasAnon = Boolean(Deno.env.get('SUPABASE_ANON_KEY'))
      const hasService = Boolean(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
      return new Response(
        JSON.stringify({ ok: true, env: { url: hasUrl, anon: hasAnon, service: hasService } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      // Prefer service role for server-side privileged operations (RLS-safe), fallback to anon.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { dataType, location = 'global', latitude, longitude, startDate, endDate, parameters }: NASADataRequest = await req.json()

    // Build cache key
    let cacheLocationKey = location
    if (dataType === 'NASA_POWER') {
      const now = new Date()
      const endD = endDate ? new Date(endDate) : now
      const startD = startDate ? new Date(startDate) : new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
      const DEFAULT_PARAMS = ['T2M', 'RH2M', 'WS2M', 'ALLSKY_SFC_SW_DWN']
      const paramList = (parameters && parameters.length ? parameters : DEFAULT_PARAMS)
      cacheLocationKey = `lat=${latitude},lon=${longitude},start=${toYMD(startD)},end=${toYMD(endD)},params=${paramList.join(',')}`
    }

    // Basic rate limiting: 60 requests per 10-minute window per anon/auth context (IP not tracked here)
    try {
      const svcKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      const authHeader = svcKey
        ? `Bearer ${svcKey}`
        : (req.headers.get('Authorization') || `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`)
      const apiKeyHeader = svcKey ?? (Deno.env.get('SUPABASE_ANON_KEY') ?? '')
      const rateRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/upsert_rate`, {
        method: 'POST',
        headers: {
          'apikey': apiKeyHeader,
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resource: 'nasa-data', window_minutes: 10, p_user: null })
      })
      if (rateRes.ok) {
        const count = await rateRes.json()
        if (typeof count === 'number' && count > 60) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please retry later.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    } catch (rlErr) {
      console.warn('Rate limit check failed', rlErr)
    }

    // Check cache first
    const { data: cachedData } = await supabase
      .from('nasa_data_cache')
      .select('data')
      .eq('data_type', dataType)
      .eq('location', cacheLocationKey)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (cachedData) {
      console.log(`Returning cached NASA ${dataType} data for ${location}`)
      return new Response(JSON.stringify(cachedData.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Data generation/fetch
  let nasaData: Record<string, unknown>;
    if (dataType === 'NASA_POWER') {
      // Use real NASA POWER API for agro parameters
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return new Response(JSON.stringify({ error: 'latitude and longitude are required for NASA_POWER' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      nasaData = await fetchNASAPower({ latitude, longitude, startDate, endDate, parameters })
    } else {
      // Synthetic demo data for other types (placeholder)
      nasaData = generateNASAData(dataType, location, startDate, endDate, latitude, longitude, parameters)
    }

    // Cache the data
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 6) // Cache for 6 hours

    await supabase
      .from('nasa_data_cache')
      .upsert({
        data_type: dataType,
        location: cacheLocationKey,
        data: nasaData,
        expires_at: expiresAt.toISOString()
      })

    console.log(`Generated and cached NASA ${dataType} data for ${location}`)

    return new Response(JSON.stringify(nasaData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('NASA Data API Error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateNASAData(dataType: string, location: string, startDate?: string, endDate?: string, latitude?: number, longitude?: number, parameters?: string[]) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  switch (dataType) {
    case 'MODIS':
      // Vegetation health and crop monitoring
      return {
        type: 'MODIS_NDVI',
        location: location,
        timestamp: now.toISOString(),
        data: {
          ndvi_values: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            ndvi: 0.3 + Math.random() * 0.5, // NDVI range 0.3-0.8
            vegetation_health: Math.random() > 0.2 ? 'Good' : 'Stressed'
          })),
          average_ndvi: 0.55,
          trend: Math.random() > 0.5 ? 'Improving' : 'Declining',
          crop_health_score: 75 + Math.random() * 20
        }
      }
      
    case 'SMAP':
      // Soil moisture data
      return {
        type: 'SMAP_Soil_Moisture',
        location: location,
        timestamp: now.toISOString(),
        data: {
          soil_moisture_levels: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            moisture_percent: 15 + Math.random() * 25, // 15-40% moisture
            depth_cm: 5,
            status: Math.random() > 0.3 ? 'Adequate' : 'Low'
          })),
          average_moisture: 27.5,
          irrigation_recommendation: Math.random() > 0.6 ? 'Recommended' : 'Not needed',
          drought_risk: Math.random() > 0.7 ? 'High' : 'Low'
        }
      }
      
    case 'GISS':
      // Climate and temperature data
      return {
        type: 'GISS_Temperature',
        location: location,
        timestamp: now.toISOString(),
        data: {
          temperature_data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            temp_celsius: 15 + Math.random() * 20,
            humidity: 40 + Math.random() * 40,
            precipitation_mm: Math.random() * 10
          })),
          climate_trend: Math.random() > 0.5 ? 'Warming' : 'Stable',
          growing_season_outlook: Math.random() > 0.3 ? 'Favorable' : 'Challenging',
          frost_risk: Math.random() > 0.8 ? 'High' : 'Low'
        }
      }
      
    case 'OCO-2':
      // Carbon dioxide monitoring
      return {
        type: 'OCO2_Carbon',
        location: location,
        timestamp: now.toISOString(),
        data: {
          co2_levels: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            co2_ppm: 410 + Math.random() * 20,
            carbon_flux: -2 + Math.random() * 4 // Negative = absorption
          })),
          carbon_sequestration_rate: 2.5 + Math.random() * 2,
          sustainability_score: 65 + Math.random() * 30,
          recommendation: 'Consider cover crops to increase carbon absorption'
        }
      }
      
    case 'Landsat':
      // Land use and change detection
      return {
        type: 'Landsat_Land_Use',
        location: location,
        timestamp: now.toISOString(),
        data: {
          land_classification: {
            cropland: 65 + Math.random() * 20,
            forest: 10 + Math.random() * 15,
            grassland: 15 + Math.random() * 10,
            urban: 5 + Math.random() * 5,
            water: 2 + Math.random() * 3
          },
          change_detection: {
            crop_expansion: Math.random() * 5,
            deforestation_rate: Math.random() * 2,
            urbanization_rate: Math.random() * 3
          },
          land_health_index: 70 + Math.random() * 25
        }
      }

    case 'VIIRS':
      // VIIRS Enhanced Vegetation Index
      return {
        type: 'VIIRS_EVI',
        location: location,
        timestamp: now.toISOString(),
        data: {
          evi_values: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            evi: 0.2 + Math.random() * 0.6,
            quality_flag: Math.random() > 0.1 ? 'Good' : 'Marginal'
          })),
          vegetation_phenology: Math.random() > 0.5 ? 'Growing' : 'Senescent',
          biomass_estimate: 150 + Math.random() * 100
        }
      }

    case 'ECOSTRESS':
      // Evapotranspiration and water stress
      return {
        type: 'ECOSTRESS_ET',
        location: location,
        latitude: latitude || 0,
        longitude: longitude || 0,
        timestamp: now.toISOString(),
        data: {
          evapotranspiration: Array.from({ length: 15 }, (_, i) => ({
            date: new Date(thirtyDaysAgo.getTime() + i * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            et_mm_day: 3 + Math.random() * 8,
            water_stress_index: Math.random(),
            canopy_temperature: 25 + Math.random() * 15
          })),
          water_use_efficiency: 1.5 + Math.random() * 2,
          stress_level: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Moderate' : 'Low'
        }
      }

    case 'GPM_IMERG':
      // Global Precipitation Measurement
      return {
        type: 'GPM_Precipitation',
        location: location,
        latitude: latitude || 0,
        longitude: longitude || 0,
        timestamp: now.toISOString(),
        data: {
          precipitation_data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            precipitation_mm: Math.random() * 15,
            intensity: Math.random() > 0.8 ? 'Heavy' : Math.random() > 0.5 ? 'Moderate' : 'Light'
          })),
          monthly_total: 50 + Math.random() * 150,
          drought_index: Math.random() > 0.3 ? 'Normal' : 'Dry'
        }
      }

    case 'MERRA2':
      // Modern-Era Retrospective Analysis
      return {
        type: 'MERRA2_Meteorology',
        location: location,
        latitude: latitude || 0,
        longitude: longitude || 0,
        timestamp: now.toISOString(),
        data: {
          meteorological_data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            temperature_2m: 15 + Math.random() * 20,
            relative_humidity: 40 + Math.random() * 40,
            wind_speed: Math.random() * 10,
            solar_radiation: 15 + Math.random() * 25,
            reference_et0: 2 + Math.random() * 6
          })),
          climate_summary: {
            avg_temperature: 25 + Math.random() * 10,
            total_solar: 600 + Math.random() * 200,
            vapor_pressure_deficit: 0.5 + Math.random() * 2
          }
        }
      }

    case 'NASA_POWER': {
      // Handled by fetchNASAPower for real data; fallback synthetic retained above
      const requestedParams = parameters || ['T2M', 'RH2M', 'WS2M', 'ALLSKY_SFC_SW_DWN']
      return {
        type: 'NASA_POWER_Agro',
        location,
        latitude: latitude || 0,
        longitude: longitude || 0,
        timestamp: now.toISOString(),
        parameters: requestedParams,
        data: { daily_data: [] }
      }
    }

    case 'GIBS':
      // Global Imagery Browse Services
      return {
        type: 'GIBS_Imagery',
        location: location,
        timestamp: now.toISOString(),
        data: {
          available_layers: [
            'MODIS_Terra_NDVI_8Day',
            'SMAP_L3_Passive_Soil_Moisture_Option3_RootZone',
            'GPM_3IMERGHH_06_precipitation',
            'ECOSTRESS_L2_LSTE_PT_JPL'
          ],
          tile_services: {
            wmts_endpoint: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/1.0.0/',
            projection: 'EPSG:4326',
            tile_format: 'PNG'
          },
          temporal_coverage: {
            start_date: '2000-01-01',
            end_date: now.toISOString().split('T')[0]
          }
        }
      }
      
    default:
      return {
        type: 'Unknown',
        error: 'Unsupported data type'
      }
  }
}