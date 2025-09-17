import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

interface RuntimeError {
  message: string
  stack?: string
  time: string
}

export const DebugOverlay: React.FC = () => {
  const [errors, setErrors] = useState<RuntimeError[]>([])
  const [visible, setVisible] = useState<boolean>(false)
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; details: string } | null>(null)
  const [dbChecking, setDbChecking] = useState(false)

  useEffect(() => {
    function onError(event: ErrorEvent) {
      setErrors(prev => [...prev, { message: event.message, stack: event.error?.stack, time: new Date().toISOString() }])
    }
    function onRejection(event: PromiseRejectionEvent) {
      setErrors(prev => [...prev, { message: 'Unhandled Rejection: ' + (event.reason?.message || event.reason), stack: event.reason?.stack, time: new Date().toISOString() }])
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  // Auto-open overlay when errors appear
  useEffect(() => {
    if (errors.length > 0) setVisible(true)
  }, [errors.length])

  // Floating toggle button (DEV only)
  const ToggleButton = (
    <button
      onClick={() => setVisible(v => !v)}
      style={{ position: 'fixed', bottom: 12, right: 12, background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: 6, padding: '8px 10px', cursor: 'pointer', zIndex: 9998 }}
      title="Toggle Debug Overlay"
    >
      Debug {errors.length > 0 ? `(${errors.length})` : ''}
    </button>
  )

  if (!visible) return ToggleButton

  const AuthDiag: React.FC = () => {
    const { loading, isGuest, isAuthenticated, user, session } = useAuth()
    return (
      <pre>{JSON.stringify({
        loading,
        isGuest,
        isAuthenticated,
        userId: user?.id || null,
        session: !!session,
      }, null, 2)}</pre>
    )
  }

  async function runDbHealthCheck() {
    setDbChecking(true)
    try {
      // 1) Confirm we can talk to auth (no exception on getSession)
      const sessionResult = await supabase.auth.getSession()
      const hasSession = !!sessionResult.data.session
      // 2) Ping a lightweight table that should exist under RLS (profiles)
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      if (error) {
        setDbStatus({ ok: false, details: `Query error: ${error.message}` })
        return
      }
      setDbStatus({ ok: true, details: `Connected. profiles count (RLS): ${count ?? 'unknown'}; session: ${hasSession}` })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setDbStatus({ ok: false, details: `Exception: ${msg}` })
    } finally {
      setDbChecking(false)
    }
  }

  return (
    <>
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', color: '#f0f0f0', zIndex: 9999, fontFamily: 'monospace', overflow: 'auto', padding: '16px' }}>
      <button
        onClick={() => setVisible(false)}
        aria-label="Close debug overlay"
        title="Close"
        style={{ position: 'absolute', top: 8, right: 8, background: 'transparent', color: '#fff', border: '1px solid #555', padding: 6, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <X size={16} />
      </button>
      <h1 style={{ marginTop: 0 }}>Debug Overlay</h1>
      <section>
        <h2>Environment</h2>
        <pre>{JSON.stringify({
          VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
          VITE_SUPABASE_PROJECT_ID: !!import.meta.env.VITE_SUPABASE_PROJECT_ID,
          VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          VITE_SUPABASE_PUBLISHABLE_KEY: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          derived_url: (import.meta.env.VITE_SUPABASE_URL || (import.meta.env.VITE_SUPABASE_PROJECT_ID ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co` : '')) || 'MISSING'
        }, null, 2)}</pre>
      </section>
      <section>
        <h2>Location</h2>
        <pre>{JSON.stringify({ href: window.location.href, pathname: window.location.pathname }, null, 2)}</pre>
      </section>
      <section>
        <h2>Auth</h2>
        <AuthDiag />
      </section>
      <section>
        <h2>Database Health</h2>
        <button onClick={runDbHealthCheck} disabled={dbChecking} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', cursor: 'pointer', borderRadius: 4 }}>
          {dbChecking ? 'Checking…' : 'Run DB Health Check'}
        </button>
        {dbStatus && (
          <div style={{ marginTop: 8 }}>
            <div><strong>Status:</strong> {dbStatus.ok ? 'OK' : 'FAILED'}</div>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{dbStatus.details}</pre>
          </div>
        )}
      </section>
      <section>
        <h2>Errors ({errors.length})</h2>
        {errors.length === 0 && <div>No runtime errors captured yet. Interact or check console.</div>}
        {errors.map((e, i) => (
          <div key={i} style={{ marginBottom: '12px', borderBottom: '1px solid #555', paddingBottom: '8px' }}>
            <div><strong>Time:</strong> {e.time}</div>
            <div><strong>Message:</strong> {e.message}</div>
            {e.stack && <pre style={{ whiteSpace: 'pre-wrap' }}>{e.stack}</pre>}
          </div>
        ))}
      </section>
    </div>
    {ToggleButton}
    </>
  )
}

export default DebugOverlay