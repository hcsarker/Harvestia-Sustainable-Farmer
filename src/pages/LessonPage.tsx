import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { courseCatalog, type Course, type Lesson } from '@/lib/courses'
import { useCoursesCatalog } from '@/hooks/useCoursesCatalog'
import { supabase } from '@/integrations/supabase/client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useUserProgress } from '@/hooks/useUserProgress'
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

  const [dbLesson, setDbLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!courseId || !lessonId) return
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('course_lessons')
          .select('id,title,duration_minutes,content,video_url')
          .eq('id', lessonId)
          .single()
        if (error) throw error
        if (!active) return
        const mapped: Lesson = { id: data.id, title: data.title, minutes: Number(data.duration_minutes || 0), content: data.content ?? undefined, videoUrl: data.video_url ?? undefined }
        setDbLesson(mapped)
      } catch (e) {
        setDbLesson(null)
      }
    }
    void load()
    return () => { active = false }
  }, [courseId, lessonId])

  // Realtime subscription for this lesson row so changes show up immediately
  useEffect(() => {
    if (!lessonId) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel: any = (supabase as any).channel?.(`course-lesson-${lessonId}`)
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'course_lessons', filter: `id=eq.${lessonId}` }, () => {
        // reload lesson
        void (async () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
              .from('course_lessons')
              .select('id,title,duration_minutes,content,video_url')
              .eq('id', lessonId)
              .single()
            if (!error && data) {
              const mapped: Lesson = { id: data.id, title: data.title, minutes: Number(data.duration_minutes || 0), content: data.content ?? undefined, videoUrl: data.video_url ?? undefined }
              setDbLesson(mapped)
            }
          } catch (e) {
            // ignore
          }
        })()
      })
      ?.subscribe()

    return () => {
      if (channel && typeof channel.unsubscribe === 'function') {
        try { channel.unsubscribe() } catch (e) { /* ignore */ }
      }
    }
  }, [lessonId])

  const isDb = !!dbLesson

  const effectiveLesson = dbLesson ?? lesson

  // Completion state stored per-user per-course in localStorage (same key as CourseDetail)
  const { user } = useAuth()
  const { updateCourseProgress } = useUserProgress()
  const storageKey = `hsf:course:${user?.id ?? 'guest'}:${courseId ?? 'unknown'}:lessons`
  const [completed, setCompleted] = useState<boolean>(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const arr = JSON.parse(raw) as string[]
        setCompleted(arr.includes(effectiveLesson?.id ?? ''))
      } else {
        setCompleted(false)
      }
    } catch {
      setCompleted(false)
    }
  }, [storageKey, effectiveLesson])

  const persist = (next: Set<string>) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(next)))
    } catch {
      // ignore
    }
  }

  const markToggle = async () => {
    if (!effectiveLesson) return
    try {
      const raw = localStorage.getItem(storageKey)
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      const set = new Set(arr)
      if (set.has(effectiveLesson.id)) set.delete(effectiveLesson.id)
      else set.add(effectiveLesson.id)
      persist(set)
      setCompleted(set.has(effectiveLesson.id))

      // compute total lessons count (prefer DB rows)
      let total = 0
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: lessons } = await (supabase as any)
          .from('course_lessons')
          .select('id')
          .eq('course_id', courseId)
        if (lessons && lessons.length) total = lessons.length
      } catch (e) {
        // fallback to course lessons length
        total = course?.lessons.length ?? 0
      }

      const nextPct = Math.round((set.size / Math.max(1, total)) * 100)
      if (course?.id) updateCourseProgress(course.id, nextPct)
    } catch (e) {
      // ignore
    }
  }

  if (!course || !effectiveLesson) {
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

  const videoId = extractYouTubeId(effectiveLesson.videoUrl)
  const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}` : null

  return (
    <div className="container py-6">
      <Button variant="ghost" onClick={() => navigate(`/courses/${course.id}`)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{effectiveLesson.title}</CardTitle>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">{isDb ? 'Loaded from DB' : 'Using fallback lesson'}</div>
              <Button size="sm" variant={completed ? 'secondary' : 'default'} onClick={markToggle}>
                {completed ? 'Mark Incomplete' : 'Mark Complete'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {effectiveLesson.content ? (
            <div className="prose max-w-none mb-6">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{effectiveLesson.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mb-6">No lesson text available.</div>
          )}

          {embedSrc ? (
            <div className="w-full aspect-video">
              <iframe
                src={embedSrc}
                title={effectiveLesson.title}
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
