#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.VITE_SUPABASE_URL || (process.env.VITE_SUPABASE_PROJECT_ID ? `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co` : '')
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASS
  if (!url || !anon) {
    console.error('Missing VITE_SUPABASE_URL/PROJECT_ID or VITE_SUPABASE_ANON_KEY/PUBLISHABLE_KEY')
    process.exit(1)
  }
  if (!email || !password) {
    console.error('Please set TEST_EMAIL and TEST_PASS env vars to sign in for testing')
    process.exit(1)
  }

  const client = createClient(url, anon)
  const { data: signIn, error: signInErr } = await client.auth.signInWithPassword({ email, password })
  if (signInErr) {
    console.error('Sign-in error:', signInErr.message)
    process.exit(1)
  }
  const token = signIn.session?.access_token
  if (!token) {
    console.error('No access token after sign-in')
    process.exit(1)
  }

  async function call(fn, payload) {
    const res = await fetch(`${url}/functions/v1/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    const text = await res.text()
    const body = (() => { try { return JSON.parse(text) } catch { return text } })()
    return { status: res.status, body }
  }

  console.log('nasa-data health check ->')
  const nasaRes = await fetch(`${url}/functions/v1/nasa-data`, {
    method: 'GET',
    headers: { apikey: anon }
  })
  const nasaBody = await nasaRes.json()
  console.log({ status: nasaRes.status, body: nasaBody })
}

main().catch((e) => { console.error(e); process.exit(1) })
