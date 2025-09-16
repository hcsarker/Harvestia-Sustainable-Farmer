import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface RuntimeError {
  message: string
  stack?: string
  time: string
}

export const DebugOverlay: React.FC = () => {
  const [errors, setErrors] = useState<RuntimeError[]>([])
  const [visible, setVisible] = useState<boolean>(false)

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

  return (
    <>
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', color: '#f0f0f0', zIndex: 9999, fontFamily: 'monospace', overflow: 'auto', padding: '16px' }}>
      <button onClick={() => setVisible(false)} style={{ position: 'absolute', top: 8, right: 8, background: '#444', color: '#fff', border: 'none', padding: '6px 10px', cursor: 'pointer' }}>Close</button>
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