import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

type CertificateRow = {
  id: string
  course_id: string | null
  title: string
  metadata: Record<string, unknown> | null
}

type UserCertificateRow = {
  id: string
  user_id: string
  certificate_id: string
  issued_at: string
  verification_code: string | null
}

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
}

type ProgressRow = {
  course_id: string
  progress: number
  completed: boolean
}

export type UiCertificate = {
  id: string
  title: string
  description: string
  instructor: string
  issueDate: string | null
  status: 'earned' | 'in-progress' | 'available'
  grade?: string | null
  score?: number
  credentialId?: string | null
  skills?: string[]
  hoursCompleted?: number
  totalHours?: number
  icon?: string
}

function hasEnv() {
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL || !!import.meta.env.VITE_SUPABASE_PROJECT_ID
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY || !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  return hasUrl && hasKey
}

export function useCertificates() {
  const { user, isGuest } = useAuth()
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [progress, setProgress] = useState<ProgressRow[]>([])
  const [certs, setCerts] = useState<CertificateRow[]>([])
  const [userCerts, setUserCerts] = useState<UserCertificateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let canceled = false
    async function load() {
      if (!hasEnv()) {
        setLoading(false)
        return
      }
      try {
        // Load base data in parallel
        const [{ data: courseData }, { data: certData }] = await Promise.all([
          supabase.from('courses').select('id,title,description,instructor,duration,difficulty,rating,students_count,certificate,lessons_count'),
          // certificates might not be in generated types yet; cast to any
          (supabase as any).from('certificates').select('id,course_id,title,metadata'),
        ])
        if (!canceled) {
          setCourses(courseData || [])
          setCerts((certData as CertificateRow[]) || [])
        }
        if (user && !isGuest) {
          const [{ data: progData }, { data: uCertData }] = await Promise.all([
            supabase.from('user_course_progress').select('course_id,progress,completed').eq('user_id', user.id),
            // user_certificates might not be in generated types yet; cast to any
            (supabase as any).from('user_certificates').select('id,user_id,certificate_id,issued_at,verification_code').eq('user_id', user.id),
          ])
          if (!canceled) {
            setProgress((progData as ProgressRow[]) || [])
            setUserCerts((uCertData as UserCertificateRow[]) || [])
          }
        } else {
          if (!canceled) {
            setProgress([])
            setUserCerts([])
          }
        }
        if (!canceled) setError(null)
      } catch (e) {
        if (!canceled) setError(e instanceof Error ? e.message : 'Failed to load certificates')
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    load()
    return () => { canceled = true }
  }, [user, isGuest])

  const data = useMemo(() => {
    // Map courses with certificate=true
    const eligibleCourses = courses.filter(c => !!c.certificate)
    const progMap = new Map(progress.map(p => [p.course_id, p]))
    const certByCourse = new Map<string, CertificateRow | undefined>()
    for (const cert of certs) {
      if (cert.course_id) certByCourse.set(cert.course_id, cert)
    }
    const userCertSet = new Set(userCerts.map(uc => uc.certificate_id))

    const list: UiCertificate[] = eligibleCourses.map(c => {
      const p = progMap.get(c.id)
      const cert = certByCourse.get(c.id)
      // Consider earned if a certificate issuance exists OR the course is marked completed in progress
      const earned = (cert ? userCertSet.has(cert.id) : false) || (!!p && p.completed)
      const status: UiCertificate['status'] = earned ? 'earned' : (p && (p.progress ?? 0) > 0 ? 'in-progress' : 'available')
      const issued = earned ? (userCerts.find(uc => uc.certificate_id === cert?.id)?.issued_at ?? null) : null
      return {
        id: cert?.id || c.id,
        title: cert?.title || c.title,
        description: c.description ?? '',
        instructor: c.instructor ?? 'Instructor',
        issueDate: issued,
        status,
        grade: null,
        score: p?.progress ?? 0,
        credentialId: userCerts.find(uc => uc.certificate_id === cert?.id)?.verification_code ?? null,
        skills: [],
        hoursCompleted: p ? Math.round(((p.progress ?? 0) / 100) * (c.lessons_count ?? 0) * 0.5) : 0,
        totalHours: Math.round((c.lessons_count ?? 0) * 0.5),
        icon: '🎓',
      }
    })

    const earned = list.filter(l => l.status === 'earned')
    const inProgress = list.filter(l => l.status === 'in-progress')
    const available = list.filter(l => l.status === 'available')

    return { earned, inProgress, available, all: list }
  }, [courses, progress, certs, userCerts])

  return { loading, error, ...data }
}
