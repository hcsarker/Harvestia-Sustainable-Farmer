/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Settings, Award } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface Story {
  id: string
  title: string
  description: string
  image_url?: string
  difficulty: string
  estimated_time: string
  chapters_count: number
  is_published: boolean
}

interface StoryProgress {
  story_id: string
  completed_chapters: number
  total_chapters: number
  progress_percentage: number
}

export default function StoryList() {
  const navigate = useNavigate()
  const { user, isGuest, isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [stories, setStories] = useState<Story[]>([])
  const [storyProgress, setStoryProgress] = useState<Record<string, StoryProgress>>({})
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth')
    }
  }, [authLoading, isAuthenticated, navigate])

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

  const fetchStories = React.useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch published stories (or all if admin)
      const { data: storiesData, error: storiesError } = await (supabase as any)
        .from('stories')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true })

      if (storiesError) throw storiesError

      if (storiesData) {
        setStories(storiesData as any)
        
        // Fetch progress for each story if user is logged in
        if (user && !isGuest) {
          const progressMap: Record<string, StoryProgress> = {}
          
          for (const story of storiesData) {
            const { data: chaptersData } = await (supabase as any)
              .from('story_chapters')
              .select('id')
              .eq('story_id', story.id)
            
            const totalChapters = chaptersData?.length || 0
            
            if (totalChapters > 0) {
              const { data: progressData } = await supabase
                .from('user_story_progress')
                .select('completed, chapter_id')
                .eq('user_id', user.id)
                .in('chapter_id', chaptersData.map(ch => ch.id))
              
              const completedChapters = progressData?.filter(p => p.completed).length || 0
              const progressPercentage = Math.round((completedChapters / totalChapters) * 100)
              
              progressMap[story.id] = {
                story_id: story.id,
                completed_chapters: completedChapters,
                total_chapters: totalChapters,
                progress_percentage: progressPercentage
              }
            }
          }
          
          setStoryProgress(progressMap)
        }
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
      toast({
        title: 'Error',
        description: 'Failed to load stories',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [user, isGuest, toast])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStories()
    }
  }, [isAuthenticated, fetchStories])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Farm Story Journey</h1>
            <p className="text-muted-foreground mt-2">
              Choose your learning path and embark on an agricultural adventure
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => navigate('/admin/stories')} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Stories
            </Button>
          )}
        </div>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Stories Available</h3>
            <p className="text-muted-foreground">
              {isAdmin ? 'Create your first story to get started.' : 'Check back soon for new stories!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => {
            const progress = storyProgress[story.id]
            const hasProgress = progress && progress.total_chapters > 0
            
            return (
              <Card 
                key={story.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/story/${story.id}`)}
              >
                <div className="aspect-video bg-gradient-to-br from-emerald-400 to-cyan-500 relative">
                  {story.image_url && (
                    <img 
                      src={story.image_url} 
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className={getDifficultyColor(story.difficulty)}>
                      {story.difficulty}
                    </Badge>
                  </div>
                  {hasProgress && progress.progress_percentage === 100 && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary">
                        <Award className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle>{story.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {story.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{story.chapters_count} Chapters</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{story.estimated_time}</span>
                      </div>
                    </div>
                    
                    {hasProgress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Your Progress</span>
                          <span className="font-medium">
                            {progress.completed_chapters}/{progress.total_chapters}
                          </span>
                        </div>
                        <Progress value={progress.progress_percentage} className="h-2" />
                      </div>
                    )}
                    
                    <Button className="w-full" variant={hasProgress && progress.progress_percentage > 0 ? "default" : "outline"}>
                      {hasProgress && progress.progress_percentage === 100 ? 'Review' : 
                       hasProgress && progress.progress_percentage > 0 ? 'Continue' : 'Start Journey'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
