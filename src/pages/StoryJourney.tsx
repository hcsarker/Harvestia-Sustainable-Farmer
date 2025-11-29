/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
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
  Trophy,
  Star,
  Settings,
  ArrowLeft,
  BookOpen,
  Clock
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useUserProgress } from "@/hooks/useUserProgress"
import { useToast } from "@/hooks/use-toast"
import NASADataVisualization from "@/components/NASADataVisualization"
import type { StoryChapter as StoryChapterType } from "@/hooks/useStoryAdmin"

interface Story {
  id: string
  title: string
  description: string
  image_url?: string
  difficulty: string
  estimated_time: string
  chapters_count: number
}

export default function StoryJourney() {
  const { storyId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isGuest, isAuthenticated, loading } = useAuth()
  const { storyProgress, updateStoryProgress, fetchUserProgress } = useUserProgress()
  const { toast } = useToast()
  const [story, setStory] = useState<Story | null>(null)
  const [storyLoading, setStoryLoading] = useState(true)

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
  const [storyChapters, setStoryChapters] = useState<StoryChapterType[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(true)
  const [openChapterId, setOpenChapterId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Local session state for time-based progress
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const [progressOverride, setProgressOverride] = useState<Record<string, number>>({})
  const sessionStartRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const lastSavedProgressRef = useRef<number>(0)

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setIsAdmin((data as { role?: string })?.role === 'admin')
      }
    }
    checkAdmin()
  }, [user])

  const parseDurationSeconds = (duration: string | undefined) => {
    if (!duration) return 60
    const m = duration.match(/(\d+)\s*(min|m)/i)
    if (m) return Math.max(30, parseInt(m[1], 10) * 60)
    const s = duration.match(/(\d+)\s*(sec|s)/i)
    if (s) return Math.max(30, parseInt(s[1], 10))
    return 60
  }

  useEffect(() => {
    const fetchStoryAndChapters = async () => {
      if (!storyId) {
        navigate('/story')
        return
      }
      
      try {
        setStoryLoading(true)
        
        // Fetch story details
        const { data: storyData, error: storyError } = await (supabase as any)
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single()
        
        if (storyError) throw storyError
        
        if (storyData) {
          setStory(storyData as any)
          
          // Fetch chapters for this story
          const { data: chaptersData, error: chaptersError } = await (supabase as any)
            .from('story_chapters')
            .select('*')
            .eq('story_id', storyId)
            .order('chapter_number')
          
          if (chaptersError) throw chaptersError
          
          if (chaptersData) {
            setStoryChapters(chaptersData as any)
          }
        }
      } catch (error) {
        console.error('Error fetching story:', error)
        toast({
          title: 'Error',
          description: 'Failed to load story details',
          variant: 'destructive'
        })
        navigate('/story')
      } finally {
        setStoryLoading(false)
        setChaptersLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchStoryAndChapters()
    }
  }, [storyId, isAuthenticated, navigate, toast])

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

  const onCompletedClick = async (chapter: StoryChapterType) => {
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

  const startSession = (chapter: StoryChapterType) => {
    const status = effectiveStatusById[chapter.id]
    if (status === 'locked') return
    if (!user && !isGuest) {
      toast({ title: "Authentication Required", description: "Please sign in to track your progress", variant: "destructive" })
      return
    }
    // Navigate to dedicated chapter content page for richer experience
    navigate(`/story/${storyId}/chapters/${chapter.id}`)
  }

  const finishNow = async (chapter: StoryChapterType) => {
    // Directly mark complete and return (mostly for demo/testing)
    if (user) {
      await updateStoryProgress(chapter.id, 100, 'completed')
    }
    toast({ title: `Chapter ${chapter.chapter_number}`, description: "Chapter completed!" })
  }

  const getIconComponent = (iconType?: string) => {
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

  useEffect(() => {
    return () => stopTimer()
  }, [])

  if (loading || storyLoading) {
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

  if (!isAuthenticated || !story) {
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
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/story')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stories
        </Button>
      </div>

      {/* Story Header */}
      <div className="mb-8">
        <Card className="overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 aspect-video md:aspect-auto bg-gradient-to-br from-emerald-400 to-cyan-500">
              {story.image_url && (
                <img 
                  src={story.image_url} 
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="md:w-2/3">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{story.title}</CardTitle>
                    <CardDescription className="text-base">
                      {story.description}
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button onClick={() => navigate('/admin/stories')} variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {storyChapters.length} Chapters
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {story.estimated_time}
                  </Badge>
                  <Badge variant="secondary">{story.difficulty}</Badge>
                </div>
              </CardHeader>
            </div>
          </div>
        </Card>
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
        {storyChapters.map((chapter: StoryChapterType) => {
          const userProgress = getUserProgress(chapter.id)
          const progress = (progressOverride[chapter.id] ?? userProgress?.progress) || 0
          const status = effectiveStatusById[chapter.id] || userProgress?.status || chapter.status
          
          const IconComponent = getIconComponent(chapter.icon_type)
          
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

