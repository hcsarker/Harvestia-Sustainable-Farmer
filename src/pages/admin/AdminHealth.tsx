import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  detail?: string
  durationMs?: number
}

export default function AdminHealth() {
  const { user, isGuest } = useAuth()
  const [results, setResults] = useState<CheckResult[]>([])
  const [running, setRunning] = useState(false)

  const env = useMemo(() => ({
    VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PROJECT_ID: !!import.meta.env.VITE_SUPABASE_PROJECT_ID,
    VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_PUBLISHABLE_KEY: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  }), [])

  const runChecks = useCallback(async () => {
    setRunning(true)
    const list: CheckResult[] = []

    // Env check
    list.push({
      name: 'Env vars present',
      status: env.VITE_SUPABASE_URL || env.VITE_SUPABASE_PROJECT_ID ? (env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'pass' : 'fail') : 'fail',
      detail: `URL:${env.VITE_SUPABASE_URL || env.VITE_SUPABASE_PROJECT_ID} KEY:${env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY}`
    })

    // Supabase client ping (auth.getSession)
    try {
      const t0 = performance.now()
      const { data, error } = await supabase.auth.getSession()
      const t1 = performance.now()
      list.push({
        name: 'Supabase auth.getSession()',
        status: error ? 'fail' : 'pass',
        detail: error ? error.message : (data?.session ? 'session active' : 'no session'),
        durationMs: Math.round(t1 - t0)
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      list.push({ name: 'Supabase auth.getSession()', status: 'fail', detail: msg })
    }

    // Helpers
    type TableName = keyof Database['public']['Tables']
    const probeTable = async (label: string, table: TableName) => {
      try {
        const t0 = performance.now()
        const { data, error, count } = await supabase.from(table).select('id', { count: 'exact' }).limit(1)
        const t1 = performance.now()
        list.push({
          name: `Query: ${label}`,
          status: error ? (String(error.message || '').toLowerCase().includes('permission') ? 'skip' : 'fail') : 'pass',
          detail: error ? error.message : `rows:${data?.length ?? 0} count:${count ?? 'n/a'}`,
          durationMs: Math.round(t1 - t0)
        })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        list.push({ name: `Query: ${label}`, status: 'fail', detail: msg })
      }
    }

    // Table probes
    await probeTable('courses (limit 1)', 'courses')
    await probeTable('quizzes (limit 1)', 'quizzes')
    await probeTable('quiz_questions (limit 1)', 'quiz_questions')
    await probeTable('achievements (limit 1)', 'achievements')
    if (user) {
      try {
        const t0 = performance.now()
        const { data, error, count } = await supabase.from('user_quiz_results').select('id', { count: 'exact' }).eq('user_id', user.id).limit(1)
        const t1 = performance.now()
        list.push({ name: 'Query: user_quiz_results by user', status: error ? 'fail' : 'pass', detail: error ? error.message : `rows:${data?.length ?? 0} count:${count ?? 'n/a'}`, durationMs: Math.round(t1 - t0) })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        list.push({ name: 'Query: user_quiz_results by user', status: 'fail', detail: msg })
      }
      try {
        const t0 = performance.now()
        const { data, error, count } = await supabase.from('user_course_progress').select('id', { count: 'exact' }).eq('user_id', user.id).limit(1)
        const t1 = performance.now()
        list.push({ name: 'Query: user_course_progress by user', status: error ? 'fail' : 'pass', detail: error ? error.message : `rows:${data?.length ?? 0} count:${count ?? 'n/a'}`, durationMs: Math.round(t1 - t0) })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        list.push({ name: 'Query: user_course_progress by user', status: 'fail', detail: msg })
      }
      try {
        const t0 = performance.now()
        const { data, error, count } = await supabase.from('profiles').select('user_id', { count: 'exact' }).eq('user_id', user.id).limit(1)
        const t1 = performance.now()
        list.push({ name: 'Query: profiles by user', status: error ? 'fail' : 'pass', detail: error ? error.message : `rows:${data?.length ?? 0} count:${count ?? 'n/a'}`, durationMs: Math.round(t1 - t0) })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        list.push({ name: 'Query: profiles by user', status: 'fail', detail: msg })
      }
    } else {
      list.push({ name: 'user_* tables (requires login)', status: 'skip', detail: 'Login to probe user-scoped tables' })
    }

    // Edge function health check: nasa-data (GET request)
    try {
      const t0 = performance.now()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
      const response = await fetch(`${supabaseUrl}/functions/v1/nasa-data`, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        }
      })
      const t1 = performance.now()
      const data = await response.json()
      list.push({ 
        name: 'Edge: nasa-data', 
        status: response.ok ? 'pass' : 'fail', 
        detail: response.ok ? JSON.stringify(data).slice(0, 120) : `${response.status}: ${JSON.stringify(data)}`,
        durationMs: Math.round(t1 - t0) 
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      list.push({ name: 'Edge: nasa-data', status: 'fail', detail: msg })
    }







    // Storage (avatars) read/write test (upload tiny file then remove)
    if (user) {
      try {
        const key = `health-check/${user.id}-${Date.now()}.txt`
        const blob = new Blob(['ok'], { type: 'text/plain' })
        const t0 = performance.now()
        const { error: upErr } = await supabase.storage.from('avatars').upload(key, blob, { upsert: true, contentType: 'text/plain' })
        const t1 = performance.now()
        if (upErr) {
          list.push({ name: 'Storage upload (avatars)', status: 'fail', detail: upErr.message, durationMs: Math.round(t1 - t0) })
        } else {
          list.push({ name: 'Storage upload (avatars)', status: 'pass', detail: key, durationMs: Math.round(t1 - t0) })
          const t2 = performance.now()
          const { error: rmErr } = await supabase.storage.from('avatars').remove([key])
          const t3 = performance.now()
          list.push({ name: 'Storage remove (avatars)', status: rmErr ? 'fail' : 'pass', detail: rmErr ? rmErr.message : key, durationMs: Math.round(t3 - t2) })
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        list.push({ name: 'Storage (avatars) read/write', status: 'fail', detail: msg })
      }
    } else {
      list.push({ name: 'Storage (avatars) read/write', status: 'skip', detail: 'Login required' })
    }

    setResults(list)
    setRunning(false)
  }, [env, user])

  useEffect(() => {
    // auto-run on mount
    runChecks()
  }, [runChecks])

  // Admin guard (same env var style as QuizAdmin)
  const isAdmin = useMemo(() => {
    if (!user || isGuest) return false
    const allowRaw = (import.meta as unknown as { env: Record<string, string | undefined> }).env?.VITE_ADMIN_EMAILS
    const allowList = (allowRaw || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    const email = user.email?.toLowerCase() || ''
    return allowList.length ? allowList.includes(email) : false
  }, [user, isGuest])

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
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
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Environment, Supabase connectivity, and edge function reachability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-3">
            <Button onClick={runChecks} disabled={running}>{running ? 'Running…' : 'Re-run checks'}</Button>
            <div className="text-sm text-muted-foreground">Env: URL {env.VITE_SUPABASE_URL || env.VITE_SUPABASE_PROJECT_ID ? <Badge variant="default">OK</Badge> : <Badge variant="destructive">Missing</Badge>} • Key {env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY ? <Badge variant="default">OK</Badge> : <Badge variant="destructive">Missing</Badge>}</div>
          </div>
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.name} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.detail && <div className="text-sm text-muted-foreground break-all">{r.detail}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {typeof r.durationMs === 'number' && <span className="text-xs text-muted-foreground">{r.durationMs} ms</span>}
                  {r.status === 'pass' && <Badge variant="default">PASS</Badge>}
                  {r.status === 'fail' && <Badge variant="destructive">FAIL</Badge>}
                  {r.status === 'skip' && <Badge variant="secondary">SKIP</Badge>}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
