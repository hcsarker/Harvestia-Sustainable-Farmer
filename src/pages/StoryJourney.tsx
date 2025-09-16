import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
  const { user, isGuest, isAuthenticated } = useAuth()
  const { storyProgress, updateStoryProgress } = useUserProgress()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth")
    }
  }, [isAuthenticated, navigate])

  const [storyChapters, setStoryChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChapters = async () => {
      const { data, error } = await supabase
        .from('story_chapters')
        .select('*')
        .order('chapter_number')

      if (data) {
        setStoryChapters(data)
      }
      setLoading(false)
    }

    fetchChapters()
  }, [])

  const getUserProgress = (chapterId: string) => {
    return storyProgress.find(p => p.chapter_id === chapterId)
  }

  const handleChapterAction = async (chapter: any) => {
    if (chapter.status === 'locked') return

    if (!user && !isGuest) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your progress",
        variant: "destructive"
      })
      return
    }

    // Simulate chapter interaction
    const currentProgress = getUserProgress(chapter.id)?.progress || 0
    const newProgress = Math.min(100, currentProgress + 25)

    if (user) {
      await updateStoryProgress(chapter.id, newProgress, newProgress >= 100 ? 'completed' : 'current')
    }

    toast({
      title: `Chapter ${chapter.chapter_number}`,
      description: newProgress >= 100 ? "Chapter completed!" : `Progress: ${newProgress}%`
    })
  }

  if (!isAuthenticated) {
    return null
  }

  const overallProgress = storyChapters.length > 0 
    ? (storyProgress.filter(p => p.completed).length / storyChapters.length) * 100 
    : 0

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
        {storyChapters.map((chapter: any) => {
          const userProgress = getUserProgress(chapter.id)
          const progress = userProgress?.progress || 0
          const status = userProgress?.status || chapter.status
          
          const IconComponent = chapter.chapter_number === 1 ? Sprout :
                              chapter.chapter_number === 2 ? Droplets :
                              chapter.chapter_number === 3 ? Sun : Trophy
          
          return (
            <Card key={chapter.id} className="relative overflow-hidden">
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
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {status !== 'locked' && (
                      <div className="mb-3">
                        <Progress value={progress} className="w-full h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {progress}% complete
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Duration: {chapter.duration}
                    </p>
                  </div>
                  
                  <Button 
                    disabled={status === 'locked'}
                    variant={status === 'completed' ? 'outline' : 'default'}
                    onClick={() => handleChapterAction(chapter)}
                  >
                    {status === 'locked' && <Lock className="h-4 w-4 mr-2" />}
                    {status !== 'locked' && <Play className="h-4 w-4 mr-2" />}
                    {status === 'completed' ? 'Replay' : 
                     status === 'current' ? 'Continue' : 'Locked'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}