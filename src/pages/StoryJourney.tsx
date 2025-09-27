import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  MapPin, 
  Play, 
  Lock, 
  CheckCircle2, 
  Sprout,
  Droplets,
  Sun,
  Trophy
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useUserProgress } from "@/hooks/useUserProgress"
import { useToast } from "@/hooks/use-toast"
import NASADataVisualization from "@/components/NASADataVisualization"

export default function StoryJourney() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isGuest, isAuthenticated, loading } = useAuth()
  const { storyProgress, updateStoryProgress, fetchUserProgress } = useUserProgress()
  const { toast } = useToast()

  useEffect(() => {
    // Wait for auth state to resolve; if not authenticated, send to auth with redirect back to this page
    console.log('StoryJourney: Auth state check - loading:', loading, 'isAuthenticated:', isAuthenticated, 'isGuest:', isGuest)
    if (!loading && !isAuthenticated) {
      const from = encodeURIComponent(location.pathname + location.search)
      console.log('StoryJourney: Redirecting to auth with redirect:', from)
      navigate(`/auth?redirect=${from}`)
    }
  }, [isAuthenticated, loading, navigate, location, isGuest])

  // When coming back from a chapter with a completion, refresh progress and surface a toast
  useEffect(() => {
    const state = location.state as { justFinished?: string } | null
    if (state?.justFinished) {
      fetchUserProgress()
      toast({ title: 'Chapter completed', description: 'Next chapter unlocked.' })
      // Clean the state so it won\'t replay on refresh
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, fetchUserProgress, toast, navigate, location.pathname])

  type ChapterStatus = 'locked' | 'current' | 'completed' | string
  interface StoryChapter {
    id: string
    chapter_number: number
    title: string
    description: string
    duration: string
    status: ChapterStatus
  }
  const [storyChapters, setStoryChapters] = useState<StoryChapter[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(true)
  const [openChapterId, setOpenChapterId] = useState<string | null>(null)

  // Local session state for time-based progress
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const [progressOverride, setProgressOverride] = useState<Record<string, number>>({})
  const sessionStartRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const lastSavedProgressRef = useRef<number>(0)

  // Inline, rich content per chapter (can be moved to DB later)
  const CHAPTER_CONTENT: Record<number, { heading: string; sections: { title: string; text: string }[] }> = useMemo(() => ({
    1: {
      heading: "Meet Sarah and the Farm",
      sections: [
        { title: "A new beginning", text: "Sarah inherits her grandmother's farm in Green Valley. It's fertile land, but climate patterns have become unpredictable." },
        { title: "Sustainable mindset", text: "She decides to adopt climate-smart practices: crop rotation, soil moisture monitoring, and efficient irrigation." },
        { title: "First task", text: "Use satellite NDVI to check crop health and identify fields needing immediate care." },
      ]
    },
    2: {
      heading: "The Drought Challenge",
      sections: [
        { title: "Water scarcity", text: "A prolonged dry spell means every drop counts. Sarah turns to soil moisture data (SMAP)." },
        { title: "Irrigation planning", text: "She creates a schedule prioritizing stressed fields, while avoiding over-watering." },
        { title: "Outcome", text: "Water usage drops 20% with no yield penalty." },
      ]
    },
    3: {
      heading: "Climate Data Analytics",
      sections: [
        { title: "Weather windows", text: "Using GPM precipitation and temperature trends, Sarah plans planting windows to avoid extreme heat." },
        { title: "Risk management", text: "She diversifies crops and uses mulching to protect soils." },
        { title: "Decision support", text: "Dashboards summarize risk and recommend weekly actions." },
      ]
    },
    4: {
      heading: "Harvest Success",
      sections: [
        { title: "Putting it all together", text: "Sarah integrates NDVI trends, soil moisture, and forecasts to determine the harvest window." },
        { title: "Community impact", text: "She shares best practices with neighboring farms, improving resilience across the valley." },
        { title: "You did it!", text: "Completing this chapter unlocks your Story Master badge if all previous chapters are done." },
      ]
    },
  }), [])

  const parseDurationSeconds = (duration: string | undefined) => {
    if (!duration) return 60
    const m = duration.match(/(\d+)\s*(min|m)/i)
    if (m) return Math.max(30, parseInt(m[1], 10) * 60)
    const s = duration.match(/(\d+)\s*(sec|s)/i)
    if (s) return Math.max(30, parseInt(s[1], 10))
    return 60
  }

  useEffect(() => {
    const fetchChapters = async () => {
      console.log('StoryJourney: Fetching story chapters...')
      const { data, error } = await supabase
        .from('story_chapters')
        .select('*')
        .order('chapter_number')

      console.log('StoryJourney: Chapters result:', { data, error })
      
      if (error) {
        console.error('StoryJourney: Error fetching chapters:', error)
      }
      
      if (data) {
        console.log('StoryJourney: Setting chapters:', data.length, 'chapters found')
        setStoryChapters(data)
      }
      setChaptersLoading(false)
    }

    fetchChapters()
  }, [])

  const getUserProgress = useMemo(() => (
    (chapterId: string) => storyProgress.find(p => p.chapter_id === chapterId)
  ), [storyProgress])

  // Compute effective per-user status: sequential unlock
  const effectiveStatusById = useMemo(() => {
    const byId: Record<string, ChapterStatus> = {}
    const sorted = [...storyChapters].sort((a, b) => a.chapter_number - b.chapter_number)
    let previousCompleted = true // first chapter unlocked
    for (const ch of sorted) {
      const up = getUserProgress(ch.id)
      const localPct = progressOverride[ch.id]
      const isCompleted = up?.completed || (typeof localPct === 'number' && localPct >= 100)
      if (isCompleted) {
        byId[ch.id] = 'completed'
        previousCompleted = true
      } else if (previousCompleted) {
        byId[ch.id] = 'current'
        previousCompleted = false
      } else {
        byId[ch.id] = 'locked'
      }
    }
    return byId
  }, [storyChapters, getUserProgress, progressOverride])

  const stopTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    sessionStartRef.current = null
  }

  const onCompletedClick = async (chapter: StoryChapter) => {
    // Ensure freshest state, then focus the next chapter
    await fetchUserProgress()
    const sorted = [...storyChapters].sort((a, b) => a.chapter_number - b.chapter_number)
    const idx = sorted.findIndex(c => c.id === chapter.id)
    const next = sorted[idx + 1]
    if (next) {
      toast({ title: `Chapter ${chapter.chapter_number} completed`, description: `Chapter ${next.chapter_number} unlocked.` })
      const el = document.getElementById(`chapter-card-${next.id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      toast({ title: 'Story Completed', description: 'All chapters are complete. Great job!' })
    }
  }

  const startSession = (chapter: StoryChapter) => {
    const status = effectiveStatusById[chapter.id]
    if (status === 'locked') return
    if (!user && !isGuest) {
      toast({ title: "Authentication Required", description: "Please sign in to track your progress", variant: "destructive" })
      return
    }
    // Navigate to dedicated chapter content page for richer experience
    navigate(`/story/chapters/${chapter.id}`)
  }

  const finishNow = async (chapter: StoryChapter) => {
    // Directly mark complete and return (mostly for demo/testing)
    if (user) {
      await updateStoryProgress(chapter.id, 100, 'completed')
    }
    toast({ title: `Chapter ${chapter.chapter_number}`, description: "Chapter completed!" })
  }

  useEffect(() => {
    return () => stopTimer()
  }, [])

  if (loading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse h-6 w-40 bg-muted rounded mb-4" />
        <div className="space-y-3">
          <div className="h-48 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Average progress across all chapters; if none yet, 0
  const overallProgress = storyChapters.length === 0
    ? 0
    : Math.round(
        storyChapters.reduce((acc, ch) => acc + ((getUserProgress(ch.id)?.progress) || 0), 0) / storyChapters.length
      )

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Farm Story Journey</h1>
        <p className="text-muted-foreground mt-2">
          Follow Sarah's farming journey and learn sustainable agriculture through interactive storytelling with real NASA data
        </p>
      </div>

      {/* NASA Data Integration Preview */}
      <div className="mb-8">
        <NASADataVisualization 
          dataType="MODIS"
          location="Green Valley Farm"
          title="Current Crop Health"
          description="Real-time vegetation health monitoring using NASA MODIS satellite data"
        />
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
            <CardDescription>
              {storyProgress.filter(p => p.completed).length} of {storyChapters.length} chapters completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{overallProgress.toFixed(0)}% Complete</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
  {storyChapters.map((chapter: StoryChapter) => {
          const userProgress = getUserProgress(chapter.id)
          const progress = (progressOverride[chapter.id] ?? userProgress?.progress) || 0
          const status = effectiveStatusById[chapter.id] || userProgress?.status || chapter.status
          
          const IconComponent = chapter.chapter_number === 1 ? Sprout :
                              chapter.chapter_number === 2 ? Droplets :
                              chapter.chapter_number === 3 ? Sun : Trophy
          
          return (
            <Card key={chapter.id} id={`chapter-card-${chapter.id}`} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      status === 'completed' ? 'bg-primary text-primary-foreground' :
                      status === 'current' ? 'bg-secondary text-secondary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {chapter.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      status === 'completed' ? 'default' :
                      status === 'current' ? 'secondary' : 'outline'
                    }>
                      {status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {status === 'locked' && <Lock className="h-3 w-3 mr-1" />}
                      {status === 'current' && <MapPin className="h-3 w-3 mr-1" />}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Progress + Controls */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      {status === 'current' && (
                        <div className="mb-2">
                          <Progress value={progress} className="w-full h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{progress}% complete</span>
                            <span>Duration: {chapter.duration}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {status !== 'locked' && status !== 'completed' && (
                      <div className="flex items-center gap-2">
                        <Button variant="default" onClick={() => startSession(chapter)}>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      </div>
                    )}

                    {status === 'completed' && (
                      <Button variant="secondary" onClick={() => onCompletedClick(chapter)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Completed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

