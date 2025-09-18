import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
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
  const [results, setResults] = useState<CheckResult[]>([])
  const [running, setRunning] = useState(false)

  const env = useMemo(() => ({
    VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PROJECT_ID: !!import.meta.env.VITE_SUPABASE_PROJECT_ID,
    VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_PUBLISHABLE_KEY: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  }), [])

  async function runChecks() {
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
    } catch (e: any) {
      list.push({ name: 'Supabase auth.getSession()', status: 'fail', detail: e?.message })
    }

    // Simple public table query if exists (courses)
    try {
      const t0 = performance.now()
      const { data, error, count } = await supabase.from('courses').select('id', { count: 'exact', head: false }).limit(1)
      const t1 = performance.now()
      list.push({
        name: 'Query: courses (limit 1)',
        status: error ? 'fail' : 'pass',
        detail: error ? error.message : `rows:${data?.length ?? 0} count:${count ?? 'n/a'}`,
        durationMs: Math.round(t1 - t0)
      })
    } catch (e: any) {
      list.push({ name: 'Query: courses (limit 1)', status: 'fail', detail: e?.message })
    }

    // Edge function call example: nasa-data (if deployed)
    try {
      const t0 = performance.now()
      const res = await fetch('/functions/v1/nasa-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'ping' }) })
      const t1 = performance.now()
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json().catch(() => ({}))
      list.push({ name: 'Edge: nasa-data', status: 'pass', detail: JSON.stringify(body).slice(0, 120), durationMs: Math.round(t1 - t0) })
    } catch (e: any) {
      list.push({ name: 'Edge: nasa-data', status: 'fail', detail: e?.message })
    }

    setResults(list)
    setRunning(false)
  }

  useEffect(() => {
    // auto-run on mount
    runChecks()
  }, [])

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
