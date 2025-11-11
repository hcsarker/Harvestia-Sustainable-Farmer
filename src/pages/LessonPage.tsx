import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { courseCatalog, type Course, type Lesson } from '@/lib/courses'
import { useCoursesCatalog } from '@/hooks/useCoursesCatalog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

function extractYouTubeId(url?: string) {
  if (!url) return null
  try {
    // common formats
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1)
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      // embed path
      const parts = u.pathname.split('/')
      return parts[parts.length - 1]
    }
  } catch {
    // fallback: try to extract id via regex
    const m = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
    return m ? m[1] : null
  }
  return null
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { courses } = useCoursesCatalog()

  const course = useMemo<Course | undefined>(() => {
    const local = courseCatalog.find(c => c.id === courseId)
    if (local) return local
    return courses.find(c => c.id === courseId)
  }, [courseId, courses])

  const lesson: Lesson | undefined = useMemo(() => {
    return course?.lessons.find(l => l.id === lessonId)
  }, [course, lessonId])

  if (!course || !lesson) {
    return (
      <div className="container py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Lesson not found</CardTitle>
          </CardHeader>
          <CardContent>
            We couldn't find that lesson. Try going back to the course.
          </CardContent>
        </Card>
      </div>
    )
  }

  const videoId = extractYouTubeId(lesson.videoUrl)
  const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}` : null

  return (
    <div className="container py-6">
      <Button variant="ghost" onClick={() => navigate(`/courses/${course.id}`)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.content ? (
            <div className="prose max-w-none mb-6">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{lesson.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mb-6">No lesson text available.</div>
          )}

          {embedSrc ? (
            <div className="w-full aspect-video">
              <iframe
                src={embedSrc}
                title={lesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No video available for this lesson.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
