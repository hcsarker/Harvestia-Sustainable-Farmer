import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { courseCatalog, type Course, type Lesson } from '@/lib/courses'
import { supabase } from '@/integrations/supabase/client'
import { useCoursesCatalog } from '@/hooks/useCoursesCatalog'
import { useUserProgress } from '@/hooks/useUserProgress'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Award, BookOpen, CheckCircle, Clock, Star, Users } from 'lucide-react'

function useLessonChecklistKey(userId: string | null, courseId: string) {
  return `hsf:course:${userId ?? 'guest'}:${courseId}:lessons`
}

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { updateCourseProgress, courseProgress } = useUserProgress()
  const { courses } = useCoursesCatalog()
  const course = useMemo<Course | undefined>(() => {
    const local = courseCatalog.find(c => c.id === courseId)
    if (local) return local
    const fromDb = courses.find(c => c.id === courseId)
    return fromDb
  }, [courseId, courses])

  const storageKey = useLessonChecklistKey(user?.id ?? null, courseId || 'unknown')
  const [done, setDone] = useState<Set<string>>(new Set())
  const [dbLessons, setDbLessons] = useState<Lesson[] | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const arr = JSON.parse(raw) as string[]
        setDone(new Set(arr))
      }
    } catch {
      // ignore
    }
  }, [storageKey])

  const percent = useMemo(() => {
    const lessons = dbLessons ?? course?.lessons ?? []
    if (!course || lessons.length === 0) return 0
    return Math.round((done.size / lessons.length) * 100)
  }, [course, done, dbLessons])

  // Sync supabase overall progress with local checklist on mount if there's a delta
  useEffect(() => {
    if (!course) return
    const supaPct = courseProgress.find(c => c.course_id === course.id)?.progress ?? 0
    if (percent !== supaPct) {
      updateCourseProgress(course.id, percent)
    }
  }, [course, courseProgress, percent, updateCourseProgress])

  const persist = useCallback((next: Set<string>) => {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(next)))
  }, [storageKey])

  const toggleLesson = useCallback((lessonId: string) => {
    setDone(prev => {
      const next = new Set(prev)
      if (next.has(lessonId)) next.delete(lessonId)
      else next.add(lessonId)
      persist(next)
      // update overall progress
      if (course) {
        const total = (dbLessons ?? course.lessons).length
        const nextPct = Math.round((next.size / Math.max(1, total)) * 100)
        updateCourseProgress(course.id, nextPct)
      }
      return next
    })
  }, [course, persist, updateCourseProgress, dbLessons])

  const markAll = useCallback(() => {
    if (!course) return
    const lessons = dbLessons ?? course.lessons
    const all = new Set(lessons.map(l => l.id))
    setDone(all)
    persist(all)
    updateCourseProgress(course.id, 100)
  }, [course, persist, updateCourseProgress])

  // Load lessons from DB (course_lessons) if available
  const fetchDbLessons = useCallback(async () => {
    if (!course) return
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('course_lessons')
        .select('id,title,duration_minutes,content,video_url')
        .eq('course_id', course.id)
        .order('order_index', { ascending: true })
      if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped: Lesson[] = (data || []).map((r: any) => ({ id: r.id, title: r.title, minutes: Number(r.duration_minutes || 0), content: r.content ?? undefined, videoUrl: r.video_url ?? undefined }))
      setDbLessons(mapped.length ? mapped : null)
    } catch (e) {
      // ignore DB lesson load errors; fallback to synthesized/local lessons
      setDbLessons(null)
    }
  }, [course])

  useEffect(() => {
    let active = true
    if (!course) return
    void (async () => {
      if (!active) return
      await fetchDbLessons()
    })()

    // Subscribe to realtime changes for lessons of this course so UI updates automatically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel: any = (supabase as any).channel?.(`course-lessons-${course.id}`)
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'course_lessons', filter: `course_id=eq.${course.id}` }, () => {
        void fetchDbLessons()
      })
      ?.subscribe()

    return () => {
      active = false
      if (channel && typeof channel.unsubscribe === 'function') {
        try {
          channel.unsubscribe()
        } catch (e) {
          // ignore unsubscribe errors
        }
      }
    }
  }, [course, fetchDbLessons])

  if (!course) {
    return (
      <div className="container py-6">
        <Button variant="ghost" onClick={() => navigate('/courses')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Course not found</CardTitle>
            <CardDescription>We couldn't find the course you're looking for.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate('/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        {course.certificate && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Award className="h-3 w-3 mr-1" /> Certificate Eligible
          </Badge>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-1">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
              <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {course.duration}</div>
                <div className="flex items-center"><BookOpen className="h-4 w-4 mr-1" /> {course.lessons.length} lessons</div>
                <div className="flex items-center"><Users className="h-4 w-4 mr-1" /> {course.students.toLocaleString()} students</div>
                <div className="flex items-center"><Star className="h-4 w-4 mr-1 fill-current text-yellow-500" /> {course.rating}</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">Overall Progress</div>
            <div className="text-sm text-muted-foreground">{percent}%</div>
          </div>
          <Progress value={percent} className="w-full mb-4" />
          <div className="flex gap-2">
            <Button variant="default" onClick={markAll} disabled={percent === 100}>
              <CheckCircle className="h-4 w-4 mr-2" /> Mark All Complete
            </Button>
            {percent === 100 && (
              <Button variant="secondary" onClick={() => navigate('/certificates')}>
                <Award className="h-4 w-4 mr-2" /> View Certificates
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Lessons</CardTitle>
              <CardDescription>Tick off lessons as you complete them</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-3">
              <div>{dbLessons ? `Using ${dbLessons.length} lesson(s) from database` : 'Using synthesized/local lessons'}</div>
              <Button variant="outline" size="sm" onClick={() => void fetchDbLessons()}>Reload lessons</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(dbLessons ?? course.lessons).map(lesson => {
              const checked = done.has(lesson.id)
              return (
                <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <Checkbox id={lesson.id} checked={checked} onCheckedChange={() => toggleLesson(lesson.id)} />
                    {/* title as a link to lesson page; clicking title navigates, checkbox remains separate */}
                    <Link to={`/courses/${course.id}/lessons/${lesson.id}`} className={`text-sm ${checked ? 'line-through text-muted-foreground' : ''}`}>
                      {lesson.title}
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">{lesson.minutes} min</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
