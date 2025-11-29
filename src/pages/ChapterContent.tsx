import { useEffect, useMemo, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Sprout,
  Droplets,
  Sun,
  Trophy,
  ArrowLeft,
  Check,
  BookOpen,
  Sparkles,
  Map,
  Leaf,
  CloudRain,
  ThermometerSun,
  MapPin,
  Star
} from 'lucide-react'
import NASADataVisualization from '@/components/NASADataVisualization'
import { useAuth } from '@/hooks/useAuth'
import { useUserProgress } from '@/hooks/useUserProgress'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { StoryChapter } from '@/hooks/useStoryAdmin'

type ChapterRow = StoryChapter

type IconType = ComponentType<SVGProps<SVGSVGElement>>
const iconByNumber: Record<number, IconType> = {
  1: Sprout,
  2: Droplets,
  3: Sun,
  4: Trophy,
}

const getIconComponent = (iconType?: string): IconType => {
  switch (iconType) {
    case 'Droplets': return Droplets
    case 'Sun': return Sun
    case 'Trophy': return Trophy
    case 'MapPin': return MapPin
    case 'Star': return Star
    case 'Sprout':
    default: return Sprout
  }
}

export default function ChapterContent() {
  const { storyId, chapterId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()
  const { updateStoryProgress, storyProgress } = useUserProgress()
  const { toast } = useToast()

  const [chapter, setChapter] = useState<ChapterRow | null>(null)
  const [pct, setPct] = useState(0)
  const [checks, setChecks] = useState<boolean[]>([])

  const userPct = useMemo(() => storyProgress.find(p => p.chapter_id === chapterId)?.progress ?? 0, [storyProgress, chapterId])

  useEffect(() => {
    if (!chapterId) return
    const load = async () => {
      const { data } = await supabase
        .from('story_chapters')
        .select('*')
        .eq('id', chapterId)
        .single()
      if (data) setChapter(data as ChapterRow)
      setPct(userPct)
    }
    load()
  }, [chapterId, userPct])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/story/${storyId}/chapters/${chapterId}`)}`)
    }
  }, [isAuthenticated, loading, navigate, storyId, chapterId])

  const Icon = chapter?.icon_type 
    ? getIconComponent(chapter.icon_type)
    : iconByNumber[(chapter?.chapter_number ?? 4) as 1 | 2 | 3 | 4] || Sprout

  // Rich, creative content per chapter
  const content = useMemo(() => {
    const commonHighlights = (items: { icon: React.ReactNode; text: string }[]) => (
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-md border bg-background">
            <div className="text-emerald-600">{it.icon}</div>
            <p className="text-sm text-muted-foreground">{it.text}</p>
          </div>
        ))}
      </div>
    )

    switch (chapter?.chapter_number) {
      case 1:
        return {
          hero: {
            subtitle: 'A new beginning in Green Valley',
            image: '/Team logo.jpg'
          },
          narrative: [
            'Sarah steps into her grandmother\'s farmhouse. Outside, rows of crops sway in a warm breeze. The land is rich, but the climate has shifted—seasons blur, rain comes late, heat lingers longer.',
            'Determined to do better, she sets a simple goal: farm smarter, not harder. Today she begins by observing the farm from above—using satellite eyes to understand what the soil and plants already know.'
          ],
          highlights: commonHighlights([
            { icon: <Map className="h-4 w-4" />, text: 'Locate fields with weak vegetation using MODIS NDVI.' },
            { icon: <Leaf className="h-4 w-4" />, text: 'Plan crop rotation to protect soil health.' },
            { icon: <BookOpen className="h-4 w-4" />, text: 'Start a farm journal: log weather, work, and results.' },
            { icon: <Sparkles className="h-4 w-4" />, text: 'Set 3 weekly goals with clear outcomes.' },
          ]),
          viz: (
            <NASADataVisualization
              dataType="MODIS"
              location="Green Valley Farm"
              title="Vegetation Health (NDVI)"
              description="Identify stressed zones to prioritize care."
            />
          ),
          checklist: [
            'Walk the boundary roads and note irrigation lines.',
            'Mark 2 fields to inspect first based on NDVI.',
            'Create this week\'s to‑do list in the farm journal.'
          ]
        }
      case 2:
        return {
          hero: { subtitle: 'Every drop counts', image: '/Team logo.jpg' },
          narrative: [
            'Weeks pass without rain. Sarah studies soil moisture to avoid guessing. She adjusts timing, pressure, and sequence, turning irrigation from habit into strategy.',
            'Slowly, the farm breathes easier—less water, same vigor.'
          ],
          highlights: commonHighlights([
            { icon: <Droplets className="h-4 w-4" />, text: 'Use SMAP soil moisture to time irrigation precisely.' },
            { icon: <CloudRain className="h-4 w-4" />, text: 'Group fields by water need, not location.' },
            { icon: <Map className="h-4 w-4" />, text: 'Rotate watering direction to reduce runoff.' },
            { icon: <Leaf className="h-4 w-4" />, text: 'Mulch beds to lock moisture and cool root zones.' },
          ]),
          viz: (
            <NASADataVisualization
              dataType="SMAP"
              location="Green Valley Farm"
              title="Soil Moisture Map"
              description="Target irrigation only where it matters."
            />
          ),
          checklist: [
            'Check soil moisture before sunrise in 3 spots.',
            'Reschedule irrigation for high‑need blocks first.',
            'Add mulch to one trial plot and compare results.'
          ]
        }
      case 3:
        return {
          hero: { subtitle: 'Read the sky like a scientist', image: '/Team logo.jpg' },
          narrative: [
            'With weather getting wilder, Sarah uses historical temperature and rainfall to choose safer planting windows. Data turns chance into planning.',
          ],
          highlights: commonHighlights([
            { icon: <ThermometerSun className="h-4 w-4" />, text: 'Avoid heat waves during germination.' },
            { icon: <CloudRain className="h-4 w-4" />, text: 'Plant before steady rain—not after a storm.' },
            { icon: <BookOpen className="h-4 w-4" />, text: 'Log outcomes to refine each season\'s calendar.' },
            { icon: <Sparkles className="h-4 w-4" />, text: 'Mix varieties to spread risk.' },
          ]),
          viz: (
            <NASADataVisualization
              dataType="GISS"
              location="Green Valley Farm"
              title="Rainfall & Temperature Trends"
              description="Pick a planting window with fewer extremes."
            />
          ),
          checklist: [
            'Pick a 10‑day window for planting based on trends.',
            'Prepare seed beds for rapid sowing when the window opens.'
          ]
        }
      default:
        return {
          hero: { subtitle: 'Bringing it all together', image: '/Team logo.jpg' },
          narrative: [
            'The farm feels different—calmer, clearer. Sarah harvests with confidence, guided by vegetation, moisture, and weather working as one story.',
            'She shares what worked with neighbors. Resilience grows across Green Valley.'
          ],
          highlights: commonHighlights([
            { icon: <Sprout className="h-4 w-4" />, text: 'Use NDVI to set the harvest sequence.' },
            { icon: <Droplets className="h-4 w-4" />, text: 'Water only the blocks that still need it.' },
            { icon: <Sun className="h-4 w-4" />, text: 'Harvest during cool, dry mornings for quality.' },
            { icon: <Trophy className="h-4 w-4" />, text: 'Celebrate progress and share the learning.' },
          ]),
          viz: (
            <NASADataVisualization
              dataType="MODIS"
              location="Green Valley Farm"
              title="Harvest Readiness"
              description="Combine signals to choose the perfect window."
            />
          ),
          checklist: [
            'Finalize harvest order from healthiest to most urgent.',
            'Plan labor and trailers for two peak mornings.'
          ]
        }
    }
  }, [chapter])

  const handleFinish = async () => {
    if (!chapterId) return
    await updateStoryProgress(chapterId, 100, 'completed')
    toast({ title: `Chapter ${chapter?.chapter_number} completed`, description: 'Great job! Next chapter unlocked.' })
    navigate('/story', { state: { justFinished: chapterId } })
  }

  const toggleCheck = async (idx: number) => {
    if (!chapterId) return
    setChecks(prev => {
      const copy = [...prev]
      copy[idx] = !copy[idx]
      const total = Math.max(copy.length, 1)
      const done = copy.filter(Boolean).length
      const nextPct = Math.min(100, Math.max(0, Math.round((done / total) * 100)))
      setPct(nextPct)
      // Fire and forget update; user can still press Finish for 100%
      updateStoryProgress(chapterId, nextPct, nextPct >= 100 ? 'completed' : 'current')
      return copy
    })
  }

  useEffect(() => {
    // initialize checklist size
    const size = content?.checklist?.length ?? 0
    if (size > 0 && checks.length !== size) {
      setChecks(Array(size).fill(false))
    }
  }, [content, checks.length])

  if (!chapter) {
    return (
      <div className="container py-6">
        <div className="h-8 w-40 bg-muted animate-pulse rounded mb-4" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/story/${storyId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Story
        </Button>
        <Badge variant="secondary">Duration: {chapter.duration}</Badge>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Hero Section with subtle animation */}
          <div className="relative bg-gradient-to-r from-emerald-100 to-amber-100">
            <div className="max-w-3xl p-6">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-emerald-600 text-emerald-50 shadow">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Chapter {chapter.chapter_number}: {chapter.title}</h1>
                  <p className="text-muted-foreground mt-1">{content?.hero?.subtitle || chapter.description}</p>
                </div>
              </div>
            </div>
            {/* Decorative image */}
            <img src={content?.hero?.image || '/Team logo.jpg'} alt="Chapter cover" className="absolute right-4 top-4 w-28 h-28 object-cover rounded-lg opacity-80 shadow" />
          </div>

          {/* Content blocks */}
          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {/* Narrative */}
              <div className="p-4 rounded-lg border bg-background space-y-3">
                <h3 className="font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4" /> Story</h3>
                {(content?.narrative || []).map((p, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
                ))}
              </div>
              {/* Highlights */}
              <div className="p-4 rounded-lg border bg-background">
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4" /> Highlights</h3>
                {content?.highlights}
              </div>
              {/* Visualization */}
              <div className="p-4 rounded-lg border bg-background">
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Map className="h-4 w-4" /> NASA Insight</h3>
                {content?.viz}
              </div>
            </div>
            <div className="space-y-4">
              {/* Checklist-driven progress */}
              <div className="p-4 rounded-lg border bg-background">
                <h3 className="font-semibold mb-2">Your Reading Progress</h3>
                <Progress value={pct} />
                <p className="text-xs text-muted-foreground mt-1">{pct}% complete</p>
                <div className="mt-3 space-y-2">
                  {(content?.checklist || []).map((item, idx) => (
                    <label key={idx} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={Boolean(checks[idx])}
                        onChange={() => toggleCheck(idx)}
                      />
                      <span className="text-muted-foreground">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-background flex items-center justify-between">
                <div className="text-sm text-muted-foreground">When finished, click Finish to complete this chapter.</div>
                <Button onClick={handleFinish}>
                  <Check className="h-4 w-4 mr-2" /> Finish
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
