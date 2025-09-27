import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

type CourseRow = {
  id: string
  title: string
  description: string | null
  instructor: string | null
  duration: string | null
  difficulty: string | null
  rating: number | null
  students_count: number | null
  certificate: boolean | null
  lessons_count: number | null
  quick_facts?: string[] | null
}

type Editable = Omit<CourseRow, 'id'>

const emptyForm: Editable = {
  title: '',
  description: '',
  instructor: '',
  duration: 'Self-paced',
  difficulty: 'Beginner',
  rating: 0,
  students_count: 0,
  certificate: true,
  lessons_count: 6,
  quick_facts: [],
}

export default function CourseAdmin() {
  const { user, isGuest } = useAuth()
  const { toast } = useToast()
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Editable>(emptyForm)
  const [qfText, setQfText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Editable>(emptyForm)
  const [editQfText, setEditQfText] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [lessons, setLessons] = useState<Array<{ id: string; title: string; minutes: number; order_index: number }>>([])
  const [newLesson, setNewLesson] = useState<{ title: string; minutes: number }>({ title: '', minutes: 10 })

  const isAdmin = useMemo(() => {
    if (!user || isGuest) return false
    const allowRaw = (import.meta as unknown as { env: Record<string, string | undefined> }).env?.VITE_ADMIN_EMAILS
    const allowList = (allowRaw || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    const email = user.email?.toLowerCase() || ''
    return allowList.length ? allowList.includes(email) : false
  }, [user, isGuest])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select('id,title,description,instructor,duration,difficulty,rating,students_count,certificate,lessons_count,quick_facts')
        .order('created_at', { ascending: true })
      if (error) {
        toast({ variant: 'destructive', title: 'Failed to load courses', description: error.message })
      }
      if (active) setCourses((data as unknown as CourseRow[]) || [])
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [toast])

  const toQuickFacts = (text: string) => text.split(',').map(s => s.trim()).filter(Boolean)

  const createCourse = async () => {
    if (!form.title.trim()) return
    setLoading(true)
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description?.trim() || null,
      instructor: form.instructor?.trim() || null,
      duration: form.duration?.trim() || null,
      difficulty: form.difficulty || null,
      rating: Number(form.rating ?? 0),
      students_count: Number(form.students_count ?? 0),
      certificate: !!form.certificate,
      lessons_count: Number(form.lessons_count ?? 0),
      quick_facts: toQuickFacts(qfText),
    }
    const { data, error } = await supabase
      .from('courses')
      .insert(payload)
      .select('id,title,description,instructor,duration,difficulty,rating,students_count,certificate,lessons_count,quick_facts')
      .single()
    setLoading(false)
    if (error) { toast({ variant: 'destructive', title: 'Create failed', description: error.message }); return }
    setCourses(list => [...list, data as unknown as CourseRow])
    setForm(emptyForm)
    setQfText('')
  }

  const startEdit = (c: CourseRow) => {
    setEditingId(c.id)
    setEditForm({
      title: c.title,
      description: c.description ?? '',
      instructor: c.instructor ?? '',
      duration: c.duration ?? 'Self-paced',
      difficulty: c.difficulty ?? 'Beginner',
      rating: c.rating ?? 0,
      students_count: c.students_count ?? 0,
      certificate: !!c.certificate,
      lessons_count: c.lessons_count ?? 0,
      quick_facts: c.quick_facts ?? [],
    })
    setEditQfText((c.quick_facts ?? []).join(', '))
  }

  const saveEdit = async () => {
    if (!editingId) return
    setLoading(true)
    const payload = {
      ...editForm,
      title: editForm.title.trim(),
      description: editForm.description?.trim() || null,
      instructor: editForm.instructor?.trim() || null,
      duration: editForm.duration?.trim() || null,
      difficulty: editForm.difficulty || null,
      rating: Number(editForm.rating ?? 0),
      students_count: Number(editForm.students_count ?? 0),
      certificate: !!editForm.certificate,
      lessons_count: Number(editForm.lessons_count ?? 0),
      quick_facts: toQuickFacts(editQfText),
    }
    const { data, error } = await supabase
      .from('courses')
      .update(payload)
      .eq('id', editingId)
      .select('id,title,description,instructor,duration,difficulty,rating,students_count,certificate,lessons_count,quick_facts')
      .single()
    setLoading(false)
    if (error) { toast({ variant: 'destructive', title: 'Update failed', description: error.message }); return }
    setCourses(list => list.map(c => c.id === editingId ? (data as unknown as CourseRow) : c))
    setEditingId(null)
  }

  const removeCourse = async (id: string) => {
    setLoading(true)
    const { error } = await supabase.from('courses').delete().eq('id', id)
    setLoading(false)
    if (error) { toast({ variant: 'destructive', title: 'Delete failed', description: error.message }); return }
    setCourses(list => list.filter(c => c.id !== id))
    if (selectedCourse === id) {
      setSelectedCourse('')
      setLessons([])
    }
  }

  // Lessons CRUD
  useEffect(() => {
    let active = true
    async function loadLessons() {
      if (!selectedCourse) { setLessons([]); return }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('course_lessons')
        .select('id,title,minutes,order_index')
        .eq('course_id', selectedCourse)
        .order('order_index', { ascending: true })
      if (error) {
        toast({ variant: 'destructive', title: 'Failed to load lessons', description: error.message })
      }
      if (active) setLessons((data as typeof lessons) || [])
    }
    void loadLessons()
    return () => { active = false }
  }, [selectedCourse, toast])

  const addLesson = async () => {
    if (!selectedCourse || !newLesson.title.trim()) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('course_lessons')
      .insert({ course_id: selectedCourse, title: newLesson.title.trim(), minutes: Math.max(1, Number(newLesson.minutes || 1)), order_index: lessons.length })
      .select('id,title,minutes,order_index')
      .single()
    if (error) { toast({ variant: 'destructive', title: 'Add lesson failed', description: error.message }); return }
    setLessons(list => [...list, data])
    setNewLesson({ title: '', minutes: 10 })
  }

  const updateLesson = async (id: string, patch: Partial<{ title: string; minutes: number }>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('course_lessons')
      .update(patch)
      .eq('id', id)
      .select('id,title,minutes,order_index')
      .single()
    if (error) { toast({ variant: 'destructive', title: 'Update lesson failed', description: error.message }); return }
    setLessons(list => list.map(l => l.id === id ? data : l))
  }

  const deleteLesson = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('course_lessons').delete().eq('id', id)
    if (error) { toast({ variant: 'destructive', title: 'Delete lesson failed', description: error.message }); return }
    setLessons(list => list.filter(l => l.id !== id))
  }

  const moveLesson = async (id: string, dir: -1 | 1) => {
    const idx = lessons.findIndex(l => l.id === id)
    const ni = idx + dir
    if (idx < 0 || ni < 0 || ni >= lessons.length) return
    const reordered = [...lessons]
    const [item] = reordered.splice(idx, 1)
    reordered.splice(ni, 0, item)
    // Recompute order_index
    const withOrder = reordered.map((l, i) => ({ ...l, order_index: i }))
    setLessons(withOrder)
    // Persist
    for (const l of withOrder) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('course_lessons').update({ order_index: l.order_index }).eq('id', l.id)
      if (error) toast({ variant: 'destructive', title: 'Reorder failed', description: error.message })
    }
  }

    const seedAllCourses = async () => {
    setLoading(true)
    const existing = new Set((courses || []).map(c => (c.title || '').toLowerCase()))
    
    // Import all courses from the local catalog
    const { courseCatalog } = await import('@/lib/courses')
    
    const toInsert: Omit<CourseRow, 'id'>[] = courseCatalog.map(course => ({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      difficulty: course.difficulty,
      rating: course.rating,
      students_count: course.students,
      certificate: course.certificate,
      lessons_count: course.lessons.length,
      quick_facts: course.tags || [],
    })).filter(c => !existing.has((c.title || '').toLowerCase()))

    if (toInsert.length) {
      const { data, error } = await supabase
        .from('courses')
        .insert(toInsert)
        .select('id,title,description,instructor,duration,difficulty,rating,students_count,certificate,lessons_count,quick_facts')
      if (error) {
        toast({ variant: 'destructive', title: 'Seed failed', description: error.message })
      } else if (data) {
        setCourses(list => [...list, ...(data as CourseRow[])])
        toast({ title: 'Success', description: `Added ${data.length} courses from local catalog` })
      }
    } else {
      toast({ title: 'Info', description: 'All courses from local catalog already exist in database' })
    }
    setLoading(false)
  }

  const seedProjectCourses = async () => {
    setLoading(true)
    const existing = new Set((courses || []).map(c => (c.title || '').toLowerCase()))
    const toInsert: Omit<CourseRow, 'id'>[] = [
      {
        title: 'Harvestia Platform Onboarding',
        description: 'End-to-end walkthrough of Harvestia: account, profile, courses, certificates, and achievements.',
        instructor: 'Harvestia Team',
        duration: '2 weeks',
        difficulty: 'Beginner',
        rating: 4.8,
        students_count: 0,
        certificate: true,
        lessons_count: 6,
        quick_facts: ['Profile setup', 'Progress tracking', 'Certificates download'],
      },
      {
        title: 'Field Data Collection with Harvestia',
        description: 'Collect story progress, course completion, and quiz scores effectively to power insights.',
        instructor: 'Harvestia Coaches',
        duration: '3 weeks',
        difficulty: 'Intermediate',
        rating: 4.7,
        students_count: 0,
        certificate: true,
        lessons_count: 7,
        quick_facts: ['Story chapters', 'User progress', 'Game scores'],
      },
      {
        title: 'Harvestia Mission, Vision and Roadmap',
        description: 'Understand Harvestia mission, vision and how they translate into roadmap and releases.',
        instructor: 'Product Leadership',
        duration: '2 weeks',
        difficulty: 'Beginner',
        rating: 4.9,
        students_count: 0,
        certificate: true,
        lessons_count: 5,
        quick_facts: ['Mission vs Vision', 'Quarterly OKRs', 'Release planning'],
      },
      {
        title: 'Project Execution with Harvestia',
        description: 'Plan, track, and ship features using agile workflows integrated with the platform.',
        instructor: 'Program Management Office',
        duration: '4 weeks',
        difficulty: 'Intermediate',
        rating: 4.8,
        students_count: 0,
        certificate: true,
        lessons_count: 8,
        quick_facts: ['Sprints & ceremonies', 'Risk & budget', 'Stakeholder updates'],
      },
    ].filter(c => !existing.has((c.title || '').toLowerCase()))

    if (toInsert.length) {
      const { data, error } = await supabase
        .from('courses')
        .insert(toInsert)
        .select('id,title,description,instructor,duration,difficulty,rating,students_count,certificate,lessons_count,quick_facts')
      if (error) {
        toast({ variant: 'destructive', title: 'Seed failed', description: error.message })
      } else if (data) {
        setCourses(list => [...list, ...(data as CourseRow[])])
      }
    }
    setLoading(false)
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Admin</CardTitle>
            <CardDescription>You are not authorized to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ask an administrator to add your email to VITE_ADMIN_EMAILS in the environment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Course</CardTitle>
          <CardDescription>Add a new course with meta and quick facts.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm(v => ({ ...v, title: e.target.value }))} placeholder="Harvestia Platform Onboarding" />
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={form.difficulty ?? 'Beginner'} onValueChange={(v) => setForm(s => ({ ...s, difficulty: v }))}>
              <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Instructor</Label>
            <Input value={form.instructor ?? ''} onChange={(e) => setForm(s => ({ ...s, instructor: e.target.value }))} placeholder="Harvestia Team" />
          </div>
          <div>
            <Label>Duration</Label>
            <Input value={form.duration ?? ''} onChange={(e) => setForm(s => ({ ...s, duration: e.target.value }))} placeholder="3 weeks" />
          </div>
          <div>
            <Label>Lessons Count</Label>
            <Input type="number" min={0} value={form.lessons_count ?? 0} onChange={(e) => setForm(s => ({ ...s, lessons_count: Number(e.target.value || 0) }))} />
          </div>
          <div>
            <Label>Certificate</Label>
            <div className="flex h-10 items-center"><Switch checked={!!form.certificate} onCheckedChange={(v) => setForm(s => ({ ...s, certificate: v }))} /></div>
          </div>
          <div className="md:col-span-3">
            <Label>Description</Label>
            <Textarea value={form.description ?? ''} onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))} placeholder="End-to-end walkthrough of Harvestia..." />
          </div>
          <div className="md:col-span-3">
            <Label>Quick Facts (comma-separated)</Label>
            <Input value={qfText} onChange={(e) => setQfText(e.target.value)} placeholder="Profile setup, Progress tracking, Certificates download" />
          </div>
          <div className="md:col-span-3">
            <Button onClick={createCourse} disabled={loading || !form.title.trim()}>Create Course</Button>
            <Button variant="secondary" className="ml-2" onClick={seedAllCourses} disabled={loading}>Seed All Courses</Button>
            <Button variant="outline" className="ml-2" onClick={seedProjectCourses} disabled={loading}>Seed Project Courses</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Manage existing courses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {courses.map(c => (
            <div key={c.id} className="border rounded-md p-3">
              {editingId === c.id ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Label>Title</Label>
                    <Input value={editForm.title} onChange={(e) => setEditForm(s => ({ ...s, title: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select value={editForm.difficulty ?? 'Beginner'} onValueChange={(v) => setEditForm(s => ({ ...s, difficulty: v }))}>
                      <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Instructor</Label>
                    <Input value={editForm.instructor ?? ''} onChange={(e) => setEditForm(s => ({ ...s, instructor: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input value={editForm.duration ?? ''} onChange={(e) => setEditForm(s => ({ ...s, duration: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Lessons Count</Label>
                    <Input type="number" min={0} value={editForm.lessons_count ?? 0} onChange={(e) => setEditForm(s => ({ ...s, lessons_count: Number(e.target.value || 0) }))} />
                  </div>
                  <div>
                    <Label>Certificate</Label>
                    <div className="flex h-10 items-center"><Switch checked={!!editForm.certificate} onCheckedChange={(v) => setEditForm(s => ({ ...s, certificate: v }))} /></div>
                  </div>
                  <div className="md:col-span-3">
                    <Label>Description</Label>
                    <Textarea value={editForm.description ?? ''} onChange={(e) => setEditForm(s => ({ ...s, description: e.target.value }))} />
                  </div>
                  <div className="md:col-span-3">
                    <Label>Quick Facts (comma-separated)</Label>
                    <Input value={editQfText} onChange={(e) => setEditQfText(e.target.value)} />
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <Button onClick={saveEdit} disabled={loading}>Save</Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.difficulty ?? '—'} • {c.duration ?? '—'} • Lessons: {c.lessons_count ?? 0} • Certificate: {c.certificate ? 'Yes' : 'No'}</div>
                    <div className="text-xs text-muted-foreground">Instructor: {c.instructor ?? '—'}</div>
                    {c.quick_facts && c.quick_facts.length ? (
                      <div className="text-xs mt-1">Quick Facts: {c.quick_facts.join(' • ')}</div>
                    ) : null}
                    <div className="mt-2">
                      <Button size="sm" variant={selectedCourse === c.id ? 'default' : 'outline'} onClick={() => setSelectedCourse(c.id)}>Manage Lessons</Button>
                    </div>
                  </div>
                  <div className="shrink-0 flex gap-2">
                    <Button size="sm" onClick={() => startEdit(c)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => removeCourse(c.id)}>Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Lessons Manager */}
      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
            <CardDescription>Manage lessons for the selected course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label>Lesson Title</Label>
                <Input value={newLesson.title} onChange={(e) => setNewLesson(s => ({ ...s, title: e.target.value }))} placeholder="Introduction" />
              </div>
              <div>
                <Label>Minutes</Label>
                <Input type="number" min={1} value={newLesson.minutes}
                  onChange={(e) => setNewLesson(s => ({ ...s, minutes: Math.max(1, Number(e.target.value || 1)) }))}
                />
              </div>
              <div className="md:col-span-3">
                <Button onClick={addLesson} disabled={!newLesson.title.trim()}>Add Lesson</Button>
              </div>
            </div>
            <div className="space-y-2">
              {lessons.map(l => (
                <div key={l.id} className="flex items-center justify-between border rounded-md p-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{l.title}</div>
                    <div className="text-xs text-muted-foreground">{l.minutes} min</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => moveLesson(l.id, -1)}>↑</Button>
                    <Button size="sm" variant="outline" onClick={() => moveLesson(l.id, 1)}>↓</Button>
                    <Button size="sm" onClick={() => updateLesson(l.id, { title: prompt('New title', l.title) || l.title })}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteLesson(l.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
