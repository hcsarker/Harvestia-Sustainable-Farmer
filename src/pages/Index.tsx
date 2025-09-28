import { FarmingCard } from "@/components/FarmingCard";
import { EnhancedFarmingCard } from "@/components/EnhancedFarmingCard";
import { FarmingTip } from "@/components/FarmingTip";
import { StatsCard } from "@/components/StatsCard";
import { InteractiveChart } from "@/components/InteractiveChart";
import { ProgressRing } from "@/components/ProgressRing";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useEffect, useRef, useState } from "react";
import { Button } from '@/components/ui/button'
import { AudioButton } from '@/components/ui/audio-button'
import { useAudio } from '@/contexts/AudioContext'
import { useLocalWeather } from '@/hooks/useLocalWeather'
import { useAuth } from '@/hooks/useAuth'
import { useUserProgress } from '@/hooks/useUserProgress'
import { useNASAData } from '@/hooks/useNASAData'
import { useAudioToast } from '@/hooks/use-audio-toast'
import { 
  Sprout, 
  Droplets, 
  Beef, 
  BarChart3, 
  Map, 
  BookOpen, 
  Trophy, 
  User,
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Zap,
  Shield,
  Heart,
  Target
} from "lucide-react";
import WeatherNow from '@/components/WeatherNow'
import SoilMoistureNow from '@/components/SoilMoistureNow'
import DataSources from '@/components/DataSources'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import SimulationPromo from '@/components/SimulationPromo'

const Index = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const { last, series, coords } = useLocalWeather()
  const { achievementsCount, fieldsMonitored, waterEfficiency, sustainabilityScore, conditionsScore, farmHealth } = useDashboardStats()
  const { courseProgress, storyProgress } = useUserProgress()
  const { fetchMODISData, fetchGPMData } = useNASAData()
  const { successToast, infoToast } = useAudioToast()
  const { playButtonSound } = useAudio()
  
  // Refs for quick action smooth scroll
  const weatherRef = useRef<HTMLDivElement | null>(null)
  const analyticsRef = useRef<HTMLDivElement | null>(null)
  const farmHealthRef = useRef<HTMLDivElement | null>(null)
  const { profile, user } = useAuth()

  // NDVI chart from MODIS (cached via edge) — dynamic replacement for static yield
  const [ndviSeries, setNdviSeries] = useState<Array<{ date: string; ndvi: number }>>([])
  const [gpmToday, setGpmToday] = useState<number | null>(null)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!coords) return
      const loc = `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`
      const res = await fetchMODISData(loc) as { data?: { ndvi_values?: { date: string; ndvi: number }[] } } | null
      if (!cancelled) {
        const vals = res?.data?.ndvi_values || []
        setNdviSeries(vals)
      }
    }
    run()
    return () => { cancelled = true }
  }, [coords, fetchMODISData])

  // Fetch GPM rainfall to show in quick action (today's precip)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!coords) return
      const loc = `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`
      const res = await fetchGPMData(coords.lat, coords.lon, loc) as { data?: { precipitation_data?: { date: string; precipitation_mm: number }[] } } | null
      if (cancelled) return
      const arr = res?.data?.precipitation_data || []
      if (arr.length) {
        const last = arr[arr.length - 1]
        setGpmToday(typeof last.precipitation_mm === 'number' ? last.precipitation_mm : null)
      }
    }
    run()
    return () => { cancelled = true }
  }, [coords, fetchGPMData])
  const ndviData = (ndviSeries && ndviSeries.length)
    ? ndviSeries.slice(-14).map(d => ({ day: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }), ndvi: Math.round(d.ndvi * 100) }))
    : [
        { day: 'Day 1', ndvi: 55 },
        { day: 'Day 2', ndvi: 57 },
        { day: 'Day 3', ndvi: 60 },
        { day: 'Day 4', ndvi: 62 },
        { day: 'Day 5', ndvi: 59 },
        { day: 'Day 6', ndvi: 61 },
        { day: 'Day 7', ndvi: 63 }
      ]

  // Quick Actions dynamic mini-metrics
  const currentTemp = typeof last?.T2M === 'number' ? last.T2M : null
  const windSpeed = typeof last?.WS2M === 'number' ? last.WS2M : null
  const ndviLatest = ndviSeries.length ? (ndviSeries[ndviSeries.length - 1].ndvi * 100) : null
  const ndviPrev = ndviSeries.length > 1 ? (ndviSeries[ndviSeries.length - 2].ndvi * 100) : null
  const ndviTrend = (ndviLatest != null && ndviPrev != null) ? (ndviLatest >= ndviPrev ? 'up' : 'down') : null
  const alertsCount = (
    (typeof conditionsScore === 'number' && conditionsScore < 45 ? 1 : 0) +
    (windSpeed != null && windSpeed > 8 ? 1 : 0) +
    (gpmToday != null && gpmToday > 20 ? 1 : 0)
  )
  const fmt2 = (n: number | null) => n == null ? '—' : n.toFixed(2)

  // Weekly Temperature (NASA POWER) with toggles for unit and range
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C')
  const [tempRange, setTempRange] = useState<7 | 14 | 30>(7)
  const toUnit = (c: number) => tempUnit === 'C' ? c : (c * 9) / 5 + 32
  const lastN = (series && series.length > 0) ? series.slice(-tempRange) : []
  const weatherData = lastN.map(d => ({
    day: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
    temp: typeof d.T2M === 'number' ? Number(toUnit(d.T2M).toFixed(2)) : null
  }))
  const weekAvg = (() => {
    const vals = weatherData.map(d => d.temp).filter((v): v is number => typeof v === 'number')
    if (!vals.length) return null
    const sum = vals.reduce((a, b) => a + b, 0)
    return Number((sum / vals.length).toFixed(2))
  })()

  const conditionLabel = typeof conditionsScore === 'number'
    ? (conditionsScore >= 80 ? 'Excellent' : conditionsScore >= 65 ? 'Good' : conditionsScore >= 45 ? 'Fair' : 'Poor')
    : 'Loading'

  const farmingModules = [
    {
      id: "crops",
      title: "Crop Management",
      description: "Advanced monitoring and optimization of crop growth using real-time satellite data and AI-powered insights",
      icon: <Sprout className="h-8 w-8" />,
      color: "primary" as const,
      stats: [
        { label: "Fields", value: String(fieldsMonitored || 0) },
        { label: "Health", value: typeof conditionsScore === 'number' ? `${conditionsScore}%` : '—' }
      ],
      features: [
        "Real-time health monitoring",
        "Predictive yield analysis", 
        "Disease detection alerts"
      ]
    },
    {
      id: "irrigation", 
      title: "Smart Irrigation",
      description: "Precision water management system powered by SMAP soil moisture data and weather forecasting",
      icon: <Droplets className="h-8 w-8" />,
      color: "accent" as const,
      stats: [
        { label: "Water Saved", value: typeof waterEfficiency === 'number' ? `${Math.max(0, waterEfficiency - 10)}%` : '—' },
        { label: "Efficiency", value: typeof waterEfficiency === 'number' ? `${waterEfficiency}%` : '—' }
      ],
      features: [
        "Automated scheduling",
        "Soil moisture tracking",
        "Weather integration"
      ]
    },
    {
      id: "livestock",
      title: "Livestock Grazing",
      description: "Optimize pasture management and animal health through satellite vegetation monitoring",
      icon: <Beef className="h-8 w-8" />,
      color: "secondary" as const,
      stats: [
        { label: "Pastures", value: String(Math.max(1, (fieldsMonitored || 1) - 4)) },
        { label: "Health", value: typeof conditionsScore === 'number' ? `${Math.min(100, Math.max(0, conditionsScore + 5))}%` : '—' }
      ],
      features: [
        "Grazing rotation planning",
        "Vegetation health tracking",
        "Animal location monitoring"
      ]
    },
    {
      id: "analytics",
      title: "Farm Analytics", 
      description: "Comprehensive data insights and reporting from NASA climate datasets and IoT sensors",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "muted" as const,
      stats: [
        { label: "Data Points", value: series?.length ? String(series.length * 4) : '—' },
        { label: "Accuracy", value: typeof sustainabilityScore === 'number' ? `${Math.min(100, Math.round((sustainabilityScore % 100)))}%` : '—' }
      ],
      features: [
        "Predictive modeling",
        "Trend analysis",
        "Custom reports"
      ]
    },
    {
      id: "mapping",
      title: "Field Mapping",
      description: "Interactive high-resolution satellite imagery analysis with boundary detection and change monitoring",
      icon: <Map className="h-8 w-8" />,
      color: "primary" as const,
      stats: [
        { label: "Resolution", value: "10cm" },
        { label: "Updates", value: "Daily" }
      ],
      features: [
        "Boundary mapping",
        "Change detection",
        "3D visualization"
      ]
    },
    {
      id: "learning",
      title: "Farming Guide",
      description: "Interactive learning platform with courses, tutorials, and expert guidance for sustainable practices",
      icon: <BookOpen className="h-8 w-8" />,
      color: "accent" as const,
      stats: [
        { label: "Courses", value: String(courseProgress.length || 0) },
        { label: "Progress", value: (() => {
          const total = Math.max(1, courseProgress.length || 0)
          const sum = courseProgress.reduce((acc, c) => acc + (c.progress || 0), 0)
          const avg = Math.round(sum / total)
          return `${avg}%`
        })() }
      ],
      features: [
        "Expert-led courses",
        "Practical tutorials",
        "Community forum"
      ]
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-6 animate-fade-in">
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-float">
            🌾 HARVESTIA 🛰️
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl -z-10"></div>
        </div>
        <p className="text-2xl font-medium text-muted-foreground">
          Welcome back, <span className="text-primary font-bold">{profile?.display_name || user?.email?.split('@')[0] || 'Sustainable Farmer'}!</span> 
        </p>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed">
          Your intelligent gateway to data-driven sustainable agriculture using cutting-edge NASA satellite insights and precision farming technology
        </p>
        
        {/* Live Stats Banner */}
        <div className="flex items-center justify-center space-x-8 py-4 px-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-primary" />
            <span className="text-sm">{typeof last?.T2M === 'number' ? `${last.T2M.toFixed(0)}°C` : '24°C'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CloudRain className="h-4 w-4 text-accent" />
            <span className="text-sm">{conditionLabel}</span>
          </div>
        </div>
      </div>

      {/* Simulation Promo */}
      <SimulationPromo />

  {/* Live local conditions and soil moisture */}
        <section ref={weatherRef} className="grid md:grid-cols-2 gap-4">
          <WeatherNow />
          <SoilMoistureNow />
        </section>

        

        {/* Enhanced Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Fields Monitored"
            value={fieldsMonitored || 0}
            icon={Map}
            trend={{ value: 8.5, isPositive: true }}
          />
          <StatsCard
            title="Water Efficiency"
            value={typeof waterEfficiency === 'number' ? `${waterEfficiency}%` : '—'}
            icon={Droplets}
            trend={{ value: 12.3, isPositive: true }}
          />
          <StatsCard
            title="Sustainability Score"
            value={sustainabilityScore || 0}
            icon={Shield}
            trend={{ value: 5.7, isPositive: true }}
          />
          <StatsCard
            title="Achievements"
            value={achievementsCount || 0}
            icon={Trophy}
            trend={{ value: 16.2, isPositive: true }}
          />
        </section>

        {/* Progress Overview */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-card to-primary/5 p-6 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Learning Progress</h3>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            {(() => {
              const total = Math.max(1, courseProgress.length || 0)
              const done = courseProgress.filter(c => c.completed).length
              const pct = Math.round((done / total) * 100)
              return (
                <>
                  <div className="flex items-center justify-center">
                    <ProgressRing progress={pct} size={100} />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {done} of {total} courses completed
                  </p>
                </>
              )
            })()}
          </div>
          
          <div ref={farmHealthRef} className="bg-gradient-to-br from-card to-accent/5 p-6 rounded-xl border border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Farm Health</h3>
              <Heart className="h-5 w-5 text-accent" />
            </div>
            <div className="flex items-center justify-center">
              <ProgressRing progress={typeof farmHealth === 'number' ? farmHealth : 50} size={100} color="hsl(var(--accent))" />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {typeof farmHealth === 'number' ? conditionLabel : 'Calibrating conditions'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-card to-secondary/5 p-6 rounded-xl border border-secondary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weekly Goals</h3>
              <Target className="h-5 w-5 text-secondary" />
            </div>
            {(() => {
              const total = Math.max(1, storyProgress.length || 0)
              const done = storyProgress.filter(s => s.status === 'completed').length
              const pct = Math.round((done / total) * 100)
              return (
                <>
                  <div className="flex items-center justify-center">
                    <ProgressRing progress={pct} size={100} color="hsl(var(--secondary))" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {done} of {total} goals achieved
                  </p>
                </>
              )
            })()}
          </div>
        </section>

        {/* Data Visualizations */}
        <section ref={analyticsRef} className="grid md:grid-cols-2 gap-6">
          <InteractiveChart
            title="Vegetation (NDVI) Trend"
            description={ndviSeries.length ? "Latest NDVI from MODIS (cached)" : "Vegetation index (last days)"}
            data={ndviData}
            xKey="day"
            yKey="ndvi"
            type="line"
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button size="sm" variant={tempUnit === 'C' ? 'default' : 'outline'} onClick={() => setTempUnit('C')}>°C</Button>
                <Button size="sm" variant={tempUnit === 'F' ? 'default' : 'outline'} onClick={() => setTempUnit('F')}>°F</Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={tempRange === 7 ? 'default' : 'outline'} onClick={() => setTempRange(7)}>7d</Button>
                <Button size="sm" variant={tempRange === 14 ? 'default' : 'outline'} onClick={() => setTempRange(14)}>14d</Button>
                <Button size="sm" variant={tempRange === 30 ? 'default' : 'outline'} onClick={() => setTempRange(30)}>30d</Button>
              </div>
            </div>
            <InteractiveChart
              title="Weekly Temperature"
              description={weatherData.length ? `Daily temperature readings (NASA POWER) · Avg ${weekAvg}°${tempUnit}` : "Daily temperature readings"}
              data={weatherData}
              xKey="day"
              yKey="temp"
              type="bar"
              color="hsl(var(--accent))"
            />
          </div>
        </section>

        {/* Daily Farming Tip */}
        <FarmingTip />

        {/* Enhanced Farming Modules Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Explore Your Smart Farm
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover powerful modules designed to transform your farming operations with cutting-edge technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmingModules.map((module, index) => (
              <div key={module.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <EnhancedFarmingCard
                  title={module.title}
                  description={module.description}
                  icon={module.icon}
                  color={module.color}
                  stats={module.stats}
                  features={module.features}
                  onClick={() => setSelectedModule(module.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Data Sources */}
        <section>
          <DataSources />
        </section>

        {/* Quick Actions */}
        <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary animate-pulse" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => { playButtonSound(); weatherRef.current?.scrollIntoView({ behavior: 'smooth' }); infoToast('Weather Section', 'Viewing current weather data') }} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105 border border-primary/20">
              <Sun className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Weather</span>
              <span className="text-xs text-muted-foreground">{fmt2(currentTemp)}°C{gpmToday != null ? ` · ${fmt2(gpmToday)}mm` : ''}</span>
            </button>
            <button onClick={() => { playButtonSound(); analyticsRef.current?.scrollIntoView({ behavior: 'smooth' }); infoToast('Analytics Section', 'Viewing farm analytics and NDVI data') }} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105 border border-accent/20">
              <BarChart3 className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Analytics</span>
              <span className="text-xs text-muted-foreground">{ndviLatest != null ? `NDVI ${fmt2(ndviLatest)}% ${ndviTrend === 'up' ? '↑' : ndviTrend === 'down' ? '↓' : ''}` : '—'}</span>
            </button>
            <button onClick={() => { playButtonSound(); weatherRef.current?.scrollIntoView({ behavior: 'smooth' }); infoToast('Wind Data', 'Checking wind conditions') }} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105 border border-secondary/20">
              <Wind className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Wind</span>
              <span className="text-xs text-muted-foreground">{fmt2(windSpeed)} m/s</span>
            </button>
            <button onClick={() => { playButtonSound(); farmHealthRef.current?.scrollIntoView({ behavior: 'smooth' }); infoToast('Farm Alerts', `${alertsCount > 0 ? `${alertsCount} alerts found` : 'No alerts currently'}`) }} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105 border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Alerts</span>
              <span className="text-xs text-muted-foreground">{alertsCount > 0 ? `${alertsCount}` : '0'}</span>
            </button>
          </div>
        </section>

      {/* Enhanced Footer */}
      <footer className="text-center pt-12 pb-6 border-t border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-2xl">
            <span className="animate-bounce-subtle">🌱</span>
            <span className="animate-bounce-subtle" style={{animationDelay: '0.1s'}}>📊</span>
            <span className="animate-bounce-subtle" style={{animationDelay: '0.2s'}}>🛰️</span>
            <span className="animate-bounce-subtle" style={{animationDelay: '0.3s'}}>🌾</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Explore • Learn • Discover • Harvest • Sustain
          </p>
          <p className="text-xs text-muted-foreground/70">
            Powered by NASA Earth Science Data & AI Technology
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
