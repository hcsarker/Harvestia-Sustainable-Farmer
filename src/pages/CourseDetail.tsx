import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { courseCatalog, type Course } from '@/lib/courses'
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
    if (!course || course.lessons.length === 0) return 0
    return Math.round((done.size / course.lessons.length) * 100)
  }, [course, done])

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
        const nextPct = Math.round((next.size / course.lessons.length) * 100)
        updateCourseProgress(course.id, nextPct)
      }
      return next
    })
  }, [course, persist, updateCourseProgress])

  const markAll = useCallback(() => {
    if (!course) return
    const all = new Set(course.lessons.map(l => l.id))
    setDone(all)
    persist(all)
    updateCourseProgress(course.id, 100)
  }, [course, persist, updateCourseProgress])

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
          <CardTitle className="text-lg">Lessons</CardTitle>
          <CardDescription>Tick off lessons as you complete them</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {course.lessons.map(lesson => {
              const checked = done.has(lesson.id)
              return (
                <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <Checkbox id={lesson.id} checked={checked} onCheckedChange={() => toggleLesson(lesson.id)} />
                    <label htmlFor={lesson.id} className={`text-sm ${checked ? 'line-through text-muted-foreground' : ''}`}>
                      {lesson.title}
                    </label>
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
