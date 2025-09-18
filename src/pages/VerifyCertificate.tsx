import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type VerifyRow = {
  id: string
  user_id: string
  certificate_id: string
  issued_at: string
  verification_code: string | null
}

type CertificateRow = {
  id: string
  title: string
  course_id: string | null
}

type CourseRow = { id: string; title: string | null; instructor: string | null; duration: string | null }

function useQr(text: string | null) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    async function gen() {
      if (!text) { setDataUrl(null); return }
      try {
        // Tiny inline QR generator (fallback): use Google Chart API-like PNG via third-party is avoided; instead draw a simple placeholder.
        // For now, draw a simple canvas with the code text. You can swap with a QR lib later.
        const canvas = document.createElement('canvas')
        const size = 160
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#fff'
        ctx.fillRect(0,0,size,size)
        ctx.strokeStyle = '#0a0'
        ctx.lineWidth = 4
        ctx.strokeRect(2,2,size-4,size-4)
        ctx.fillStyle = '#0a0'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('SCAN', size/2, size/2 - 20)
        ctx.fillStyle = '#222'
        ctx.font = '10px monospace'
        const code = text.length > 18 ? text.slice(0,18) + '…' : text
        ctx.fillText(code, size/2, size/2 + 10)
        const url = canvas.toDataURL('image/png')
        if (active) setDataUrl(url)
      } catch {
        if (active) setDataUrl(null)
      }
    }
    void gen()
    return () => { active = false }
  }, [text])
  return dataUrl
}

export default function VerifyCertificate() {
  const { code: routeCode } = useParams()
  const [code, setCode] = useState(routeCode || '')
  const [record, setRecord] = useState<VerifyRow | null>(null)
  const [cert, setCert] = useState<CertificateRow | null>(null)
  const [course, setCourse] = useState<CourseRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : 'https://harvestia.app'), [])
  const verifyUrl = code ? `${origin}/verify/${code}` : ''
  const qr = useQr(verifyUrl)

  const lookup = async (query: string) => {
    const trimmed = (query || '').trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setRecord(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rows } = await (supabase as any)
        .from('user_certificates')
        .select('id,user_id,certificate_id,issued_at,verification_code')
        .eq('verification_code', trimmed)
        .limit(1)
      const row = (rows && rows[0]) as VerifyRow | undefined
      if (!row) {
        setError('No certificate found for this code')
        setLoading(false)
        return
      }
      setRecord(row)
      // Load certificate meta and course
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: certRow } = await (supabase as any)
        .from('certificates')
        .select('id,title,course_id')
        .eq('id', row.certificate_id)
        .single()
      setCert((certRow as CertificateRow) || null)
      if (certRow?.course_id) {
        const { data: courseRow } = await supabase
          .from('courses')
          .select('id,title,instructor,duration')
          .eq('id', certRow.course_id as string)
          .single()
        setCourse((courseRow as CourseRow) || null)
      } else {
        setCourse(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (routeCode) void lookup(routeCode)
  }, [routeCode])

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Verify Certificate</CardTitle>
          <CardDescription>Enter a certificate code to check its validity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Enter verification code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button onClick={() => lookup(code)} disabled={loading || !code.trim()}>Verify</Button>
          </div>
          {loading && <div className="text-sm text-muted-foreground">Checking…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {record && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 space-y-2">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="text-green-700 font-medium">Valid Certificate</div>
                <div className="text-sm"><span className="text-muted-foreground">Code:</span> {record.verification_code}</div>
                <div className="text-sm"><span className="text-muted-foreground">Issued:</span> {new Date(record.issued_at).toLocaleString()}</div>
                {cert && <div className="text-sm"><span className="text-muted-foreground">Certificate:</span> {cert.title}</div>}
                {course && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Course:</span> {course.title || '—'}
                    {course.instructor ? ` • Instructor: ${course.instructor}` : ''}
                    {course.duration ? ` • Duration: ${course.duration}` : ''}
                  </div>
                )}
                <div className="pt-2">
                  <Link to={`/certificates`} className="text-primary underline">View your certificates</Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {qr ? (
                  <a href={verifyUrl} target="_blank" rel="noreferrer">
                    <img src={qr} alt="QR Code" className="border rounded p-2 bg-white" />
                  </a>
                ) : (
                  <div className="h-40 w-40 flex items-center justify-center border rounded bg-white text-xs text-muted-foreground">QR not available</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
