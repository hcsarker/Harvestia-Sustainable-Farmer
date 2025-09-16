import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useNASAData } from '@/hooks/useNASAData'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

type ParamKey = 'T2M' | 'RH2M' | 'WS2M' | 'ALLSKY_SFC_SW_DWN'

const DEFAULT_PARAMS: ParamKey[] = ['T2M', 'RH2M', 'WS2M', 'ALLSKY_SFC_SW_DWN']

const PARAM_LABELS: Record<ParamKey, string> = {
  T2M: 'Air Temp (°C)',
  RH2M: 'Rel. Humidity (%)',
  WS2M: 'Wind Speed (m/s)',
  ALLSKY_SFC_SW_DWN: 'Solar (kWh/m²/day)'
}

const PARAM_COLORS: Record<ParamKey, string> = {
  T2M: 'hsl(var(--chart-1, 220 90% 56%))',
  RH2M: 'hsl(var(--chart-2, 160 84% 39%))',
  WS2M: 'hsl(var(--chart-3, 29 100% 52%))',
  ALLSKY_SFC_SW_DWN: 'hsl(var(--chart-4, 291 64% 42%))'
}

interface NASAPowerChartProps {
  latitude?: number
  longitude?: number
}

export const NASAPowerChart: React.FC<NASAPowerChartProps> = ({ latitude, longitude }) => {
  const { fetchNASAPowerData, loading, error } = useNASAData()
  const [selected, setSelected] = useState<Record<ParamKey, boolean>>({
    T2M: true,
    RH2M: false,
    WS2M: false,
    ALLSKY_SFC_SW_DWN: true
  })

  const [series, setSeries] = useState<Array<{ date: string } & Partial<Record<ParamKey, number | null>>>>([])

  const activeParams = useMemo(
    () => (Object.keys(selected) as ParamKey[]).filter(k => selected[k]),
    [selected]
  )

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        setSeries([])
        return
      }
      const params: ParamKey[] = DEFAULT_PARAMS
      const data = await fetchNASAPowerData(latitude, longitude, params)
      if (cancelled) return
      if (data?.data?.daily_data) {
        setSeries(data.data.daily_data)
      } else {
        setSeries([])
      }
    }
    run()
    return () => { cancelled = true }
  }, [latitude, longitude, fetchNASAPowerData])

  const config = useMemo(() => {
    const entries = (Object.keys(PARAM_LABELS) as ParamKey[]).map((k) => [
      k,
      { label: PARAM_LABELS[k], color: PARAM_COLORS[k] }
    ])
    return Object.fromEntries(entries)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          NASA POWER (30-day)
          {typeof latitude === 'number' && typeof longitude === 'number' && (
            <Badge variant="outline">{latitude.toFixed(2)}, {longitude.toFixed(2)}</Badge>
          )}
          {loading && <Badge variant="secondary">Loading…</Badge>}
          {error && <Badge variant="destructive">{String(error)}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Controls */}
          <div className="w-full xl:w-60 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Parameters</Label>
            </div>
            {(Object.keys(PARAM_LABELS) as ParamKey[]).map((k) => (
              <div key={k} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded" style={{ backgroundColor: PARAM_COLORS[k] }} />
                  <Label htmlFor={`param-${k}`}>{PARAM_LABELS[k]}</Label>
                </div>
                <Switch
                  id={`param-${k}`}
                  checked={selected[k]}
                  onCheckedChange={(v) => setSelected((s) => ({ ...s, [k]: v }))}
                />
              </div>
            ))}
            <Separator />
            <p className="text-xs text-muted-foreground">
              Showing last ~30 days from NASA POWER Agro.
            </p>
          </div>

          {/* Chart */}
          <div className="flex-1 min-h-[280px]">
            <ChartContainer config={config} className="w-full h-[280px]">
              <LineChart data={series} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                {activeParams.map((k) => (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stroke={PARAM_COLORS[k]}
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default NASAPowerChart
