import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useUserProgress } from '@/hooks/useUserProgress'

type CertificateRow = {
  id: string
  user_id: string
  course_id: string
  certificate_name: string
  certificate_number: string
  issued_date: string
  certificate_type: string
  completion_percentage: number
  total_score: number | null
  time_spent_hours: number | null
  is_verified: boolean
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
  courseId: string
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
  // Optional local download generator (simple text blob as placeholder for PDF)
  download?: () => void
}

function hasEnv() {
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL || !!import.meta.env.VITE_SUPABASE_PROJECT_ID
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY || !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  return hasUrl && hasKey
}

export function useCertificates() {
  const { user, isGuest } = useAuth()
  const { courseProgress: userCourseProgress } = useUserProgress()
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
          // Load user's certificates with new structure
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase as any).from('certificates').select('id,user_id,course_id,certificate_name,certificate_number,issued_date,certificate_type,completion_percentage,total_score,time_spent_hours,is_verified,metadata'),
        ])
        if (!canceled) {
          setCourses(courseData || [])
          setCerts((certData as CertificateRow[]) || [])
        }
        if (user && !isGuest) {
          const [{ data: progData }] = await Promise.all([
            supabase.from('user_course_progress').select('course_id,progress,completed').eq('user_id', user.id),
          ])
          if (!canceled) {
            setProgress((progData as ProgressRow[]) || [])
            // Filter certificates for current user
            const userCertificates = (certData as CertificateRow[])?.filter(cert => cert.user_id === user.id) || []
            setUserCerts(userCertificates.map(cert => ({
              id: cert.id,
              user_id: cert.user_id,
              certificate_id: cert.id,
              issued_at: cert.issued_date,
              verification_code: cert.certificate_number
            })))
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
  }, [user, isGuest, userCourseProgress])

  const userEmail = user?.email || null
  // Prefer a display name if available from auth metadata; try multiple keys then prettify email local-part
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (user as any)?.user_metadata || {}
  const nameCandidates: Array<string | undefined> = [
    meta.full_name,
    meta.name,
    meta.display_name,
    meta.username,
    [meta.first_name, meta.last_name].filter(Boolean).join(' ').trim() || undefined,
  ]
  const prettyFromEmail = (email: string | null): string | null => {
    if (!email) return null
    const local = email.split('@')[0]
    const parts = local.split(/[._-]+/).filter(Boolean)
    if (!parts.length) return local
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
  }
  const userName = (nameCandidates.find(Boolean) as string | undefined) || prettyFromEmail(userEmail) || 'Valued Learner'
  const data = useMemo(() => {
      // Consider all courses; show certificates based on new dynamic structure
      const eligibleCourses = courses
    const progMap = new Map(progress.map(p => [p.course_id, p]))
    
    // Map certificates by course_id for easier lookup
    const userCertsByCourse = new Map<string, CertificateRow>()
    for (const cert of certs) {
      if (cert.course_id && (!user || cert.user_id === user?.id)) {
        userCertsByCourse.set(cert.course_id, cert)
      }
    }

    const list: UiCertificate[] = eligibleCourses.map(c => {
      const p = progMap.get(c.id)
      const cert = userCertsByCourse.get(c.id)
      
      // Consider earned if user has a certificate for this course OR course is completed
      const earned = !!cert || (!!p && p.completed)
      const status: UiCertificate['status'] = earned ? 'earned' : (p && (p.progress ?? 0) > 0 ? 'in-progress' : 'available')
      const issued = cert?.issued_date ?? null
      // Real PDF generator (on-demand) using jsPDF via dynamic import
      const download = async () => {
        if (!earned) return
        try {
          const { jsPDF } = await import('jspdf')
          const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' })
          const pageWidth = doc.internal.pageSize.getWidth()
          const pageHeight = doc.internal.pageSize.getHeight()
          const margin = 48

          // Helper: load a public asset as Data URL
          const loadDataUrl = async (url: string): Promise<string | null> => {
            try {
              const res = await fetch(url)
              if (!res.ok) return null
              const blob = await res.blob()
              return await new Promise(resolve => {
                const reader = new FileReader()
                reader.onloadend = () => resolve((reader.result as string) || null)
                reader.readAsDataURL(blob)
              })
            } catch {
              return null
            }
          }

          // Document properties and title
          doc.setProperties?.({ title: 'certificate' })

          // Determine template style (fallback classic)
          // Try reading style from courses table metadata if present via certificates.metadata or default to classic
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const template: 'classic' | 'modern' | 'green' = ((cert?.metadata as any)?.certificateTemplate) || 'classic'

          // Header band with logo
          doc.setFillColor(237, 247, 237) // light green-ish
          doc.rect(0, 0, pageWidth, 100, 'F')
          const logoUrl = encodeURI('/Team logo.jpg')
          const logo = await loadDataUrl(logoUrl)
          if (logo) {
            // Place larger and keep aspect ratio
            const logoW = 170
            const logoH = 60
            const logoX = margin
            const logoY = 22
            doc.addImage(logo, 'JPEG', logoX, logoY, logoW, logoH, undefined, 'FAST')
            // Make the logo clickable (interactive): links to home/origin
            const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'https://harvestia.app'
            // jsPDF link uses rectangle
            doc.link?.(logoX, logoY, logoW, logoH, { url: origin })
          }

          // Borders & accent per template
          if (template === 'modern') {
            // Side accents
            doc.setFillColor(232, 244, 232)
            doc.rect(0, 100, 16, pageHeight - 100, 'F')
            doc.rect(pageWidth - 16, 100, 16, pageHeight - 100, 'F')
          }
          // Outer border
          doc.setDrawColor(template === 'modern' ? 170 : 200)
          doc.setLineWidth(2)
          doc.roundedRect?.(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 12, 12, 'S')
          // Inner border
          const innerPad = template === 'modern' ? 14 : 10
          doc.setDrawColor(template === 'modern' ? 185 : 210)
          doc.setLineWidth(1)
          doc.roundedRect?.(margin + innerPad, margin + innerPad, pageWidth - (margin + innerPad) * 2, pageHeight - (margin + innerPad) * 2, 10, 10, 'S')

          // Watermark (drawn first so it's behind text)
          doc.saveGraphicsState?.()
          doc.setTextColor(240, 240, 240)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(110)
          doc.text('HARVESTIA', pageWidth / 2, pageHeight / 2 + 20, { align: 'center', angle: -20 })
          doc.restoreGraphicsState?.()

          // Big centered title
          doc.setTextColor(28, 28, 28)
          if (template === 'modern') {
            doc.setFont('times', 'bold')
            doc.setFontSize(40)
          } else {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(36)
          }
          doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 150, { align: 'center' })

          // Recipient name prominent
          doc.setFontSize(30)
          doc.setFont('helvetica', 'bold')
          doc.text(userName, pageWidth / 2, 210, { align: 'center' })

          // Course details
          const courseTitle = cert?.certificate_name || c.title
          const issuedOn = issued ?? new Date().toISOString().slice(0, 10)
          const instructor = c.instructor ?? 'Instructor'
          const credentialId = cert?.certificate_number ?? null
          if (template === 'modern') doc.setTextColor(34, 68, 48)
          doc.setFont('times', 'italic')
          doc.setFontSize(15)
          doc.text('is hereby awarded to', pageWidth / 2, 238, { align: 'center' })
          doc.setFont('times', 'normal')
          doc.setFontSize(16)
          doc.text('for the successful completion of', pageWidth / 2, 262, { align: 'center' })
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(20)
          doc.text(courseTitle, pageWidth / 2, 292, { align: 'center' })
          doc.setFont('times', 'italic')
          doc.setFontSize(14)
          doc.text(`Dated: ${issuedOn}`, pageWidth / 2, 320, { align: 'center' })

          // Additional course details row (interactive links below)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(12)
          const details: string[] = []
          if (instructor) details.push(`Instructor: ${instructor}`)
          if (c.duration) details.push(`Duration: ${c.duration}`)
          if (c.difficulty) details.push(`Level: ${c.difficulty}`)
          if (typeof c.lessons_count === 'number') details.push(`Lessons: ${c.lessons_count}`)
          const estHours = Math.round((c.lessons_count ?? 0) * 0.5)
          if (estHours) details.push(`Estimated Hours: ${estHours}`)
          const detailsLine = details.join(' • ')
          if (detailsLine) {
            doc.text(detailsLine, pageWidth / 2, 342, { align: 'center', maxWidth: pageWidth - margin * 2 })
          }
          if (c.description) {
            doc.setFontSize(11)
            const descY = 362
            doc.text(String(c.description), pageWidth / 2, descY, { align: 'center', maxWidth: pageWidth - margin * 2.5 })
          }

          // Footer brand and signatures
          doc.setFontSize(12)
          doc.setTextColor(template === 'modern' ? 40 : 80)
          // Signature lines
          doc.setDrawColor(150)
          // Instructor (with demo signature scribble)
          const sigLeftX1 = margin + 40
          const sigBaseY = pageHeight - margin - 78
          doc.setDrawColor(60)
          doc.setLineWidth(0.8)
          // draw simple scribble to emulate a signature
          let x = sigLeftX1, y = sigBaseY
          const seg = 16
          for (let i = 0; i < 12; i++) {
            const nx = x + seg
            const ny = y + (i % 2 === 0 ? 6 : -6)
            doc.line(x, y, nx, ny)
            x = nx; y = ny
          }
          // signature baseline
          doc.setDrawColor(150)
          doc.setLineWidth(0.6)
          doc.line(margin + 20, pageHeight - margin - 70, margin + 260, pageHeight - margin - 70)
          doc.setFont('times', 'italic')
          doc.text(instructor, margin + 20, pageHeight - margin - 50)
          doc.setFont('times', 'normal')
          doc.text('Instructor', margin + 20, pageHeight - margin - 34)
          // Authorized by
          // demo signature scribble on the right
          const sigRightXStart = pageWidth - margin - 260
          x = sigRightXStart; y = sigBaseY
          doc.setDrawColor(60)
          doc.setLineWidth(0.8)
          for (let i = 0; i < 12; i++) {
            const nx = x + seg
            const ny = y + (i % 2 === 0 ? -6 : 6)
            doc.line(x, y, nx, ny)
            x = nx; y = ny
          }
          doc.setDrawColor(150)
          doc.setLineWidth(0.6)
          doc.line(pageWidth - margin - 260, pageHeight - margin - 70, pageWidth - margin - 20, pageHeight - margin - 70)
          doc.setFont('times', 'italic')
          doc.text('Harvestia', pageWidth - margin - 260, pageHeight - margin - 50)
          doc.setFont('times', 'normal')
          doc.text('Authorized Signature', pageWidth - margin - 260, pageHeight - margin - 34)

          // Details row: credential id and branding
          doc.setFontSize(11)
          doc.setTextColor(90)
          const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'https://harvestia.app'
          if (credentialId) {
            const verifyUrl = `${origin}/verify/${credentialId}`
            doc.text(`Certificate ID: ${credentialId}`, margin + 20, pageHeight - margin + 6)
            doc.text(`Verify: ${verifyUrl}`, margin + 220, pageHeight - margin + 6)
            // Clickable verification link area (interactive)
            doc.link?.(margin + 216, pageHeight - margin - 6, 260, 16, { url: verifyUrl })
            // Draw a placeholder QR box linking to verify URL
            const qrSize = 48
            const qrX = pageWidth / 2 - qrSize / 2
            const qrY = pageHeight - margin - qrSize - 18
            doc.setDrawColor(120)
            doc.setLineWidth(1)
            doc.rect(qrX, qrY, qrSize, qrSize)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.text('QR', qrX + qrSize / 2, qrY + qrSize / 2 + 3, { align: 'center' })
            doc.link?.(qrX, qrY, qrSize, qrSize, { url: verifyUrl })
          }
          doc.text('Harvestia • Learn sustainable farming with satellite data', pageWidth - margin - 360, pageHeight - margin + 6)

          // Save as a generic filename
          doc.save('certificate.pdf')
        } catch (e) {
          // Fallback to text download if jsPDF not available
          const lines = [
            `Certificate of Completion`,
            `Course: ${cert?.certificate_name || c.title}`,
            `User: ${userName}`,
            `Issued: ${issued ?? new Date().toISOString().slice(0,10)}`
          ]
          const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `certificate.txt`
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        }
      }
      return {
          id: cert?.id || c.id,
        courseId: c.id,
          title: cert?.certificate_name || c.title,
        description: c.description ?? '',
        instructor: c.instructor ?? 'Instructor',
        issueDate: issued,
        status,
        grade: cert?.metadata?.grade as string ?? null,
        score: cert?.total_score ?? p?.progress ?? 0,
          credentialId: cert?.certificate_number ?? null,
        skills: [],
        hoursCompleted: p ? Math.round(((p.progress ?? 0) / 100) * (c.lessons_count ?? 0) * 0.5) : 0,
        totalHours: Math.round((c.lessons_count ?? 0) * 0.5),
        icon: '🎓',
        download,
      }
    })

    const earned = list.filter(l => l.status === 'earned')
    const inProgress = list.filter(l => l.status === 'in-progress')
    const available = list.filter(l => l.status === 'available')

    return { earned, inProgress, available, all: list }
  }, [courses, progress, certs, userName, user])

  return { loading, error, ...data }
}
