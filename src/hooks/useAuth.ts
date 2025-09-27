import { useState, useEffect, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  location: string | null
  farm_type: string | null
  join_date: string
  level: number
  experience_points: number
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const profileChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Detect missing Supabase environment early to avoid accessing client
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL || !!import.meta.env.VITE_SUPABASE_PROJECT_ID
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY || !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  const missingEnv = !(hasUrl && hasKey)

  useEffect(() => {
    // If env is missing, don't touch supabase; default to guest mode if chosen
    if (missingEnv) {
      const guestMode = localStorage.getItem('guest_mode')
      setIsGuest(guestMode === 'true')
      setLoading(false)
      return
    }

    // Set up auth state listener (only when env present)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          setIsGuest(false)
          // Fetch user profile
          setTimeout(async () => {
            await fetchUserProfile(session.user.id)
          }, 0)
          // Set up realtime listener for this user's profile
          setupProfileRealtime(session.user.id)
        } else {
          setProfile(null)
          teardownProfileRealtime()
        }

        setLoading(false)
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        setIsGuest(false)
        fetchUserProfile(session.user.id)
        setupProfileRealtime(session.user.id)
      }

      setLoading(false)
    })

    // Check for guest mode (only relevant if no current session)
    const guestMode = localStorage.getItem('guest_mode')
    if (guestMode === 'true' && !session) {
      setIsGuest(true)
      setLoading(false)
    }

    return () => {
      subscription.unsubscribe()
      teardownProfileRealtime()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingEnv])

  const setupProfileRealtime = (userId: string) => {
    try {
      // Clean up any existing channel first
      if (profileChannelRef.current) {
        supabase.removeChannel(profileChannelRef.current)
        profileChannelRef.current = null
      }
      const channel = supabase
        .channel(`profiles-user-${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${userId}` }, (payload: RealtimePostgresChangesPayload<UserProfile>) => {
          // Prefer payload.new when available, otherwise refetch
          const newRow = payload.new
          if (newRow) {
            setProfile(newRow as unknown as UserProfile)
          } else {
            fetchUserProfile(userId)
          }
        })
        .subscribe()
      profileChannelRef.current = channel
    } catch (e) {
      console.warn('Failed to setup realtime for profile:', e)
    }
  }

  const teardownProfileRealtime = () => {
    if (profileChannelRef.current) {
      try { supabase.removeChannel(profileChannelRef.current) } catch (e) {
        console.warn('removeChannel failed', e)
      }
      profileChannelRef.current = null
    }
  }

  const fetchUserProfile = async (userId: string) => {
    console.log('useAuth: Fetching profile for user:', userId)
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('useAuth: Profile fetch result:', { data, error, status })

      if (error) {
        // If no row found (status 406/404), try to create a default profile
        if (status === 406 || status === 404) {
          console.log('useAuth: Profile not found, creating default profile')
          await ensureProfile(userId)
          return
        }
        console.error('useAuth: Error fetching profile:', error)
        return
      }

      console.log('useAuth: Setting profile data:', data)
      setProfile(data)
    } catch (error) {
      console.error('useAuth: Error fetching profile:', error)
    }
  }

  const ensureProfile = async (userId: string) => {
    console.log('useAuth: Ensuring profile exists for user:', userId)
    try {
      // Use email prefix as a default display name if available in session
      const email = session?.user?.email ?? ''
      const displayName = email ? email.split('@')[0] : null
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          display_name: displayName,
          level: 1,
          experience_points: 0,
        }, { onConflict: 'user_id' })
      if (error) {
        console.warn('Failed to create default profile (check RLS/policies):', error)
        return
      }
      await fetchUserProfile(userId)
    } catch (e) {
      console.warn('Error ensuring profile exists:', e)
    }
  }

  const signOut = async () => {
    if (missingEnv) {
      // In guest-only mode, just clear guest flag
      setIsGuest(false)
      localStorage.removeItem('guest_mode')
      return { error: null as unknown as Error | null }
    }
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setIsGuest(false)
      localStorage.removeItem('guest_mode')
    }
    return { error }
  }

  const enterGuestMode = () => {
    setIsGuest(true)
    localStorage.setItem('guest_mode', 'true')
  }

  const exitGuestMode = () => {
    setIsGuest(false)
    localStorage.removeItem('guest_mode')
  }

  return {
    user,
    session,
    profile,
    loading,
    isGuest,
    signOut,
    enterGuestMode,
    exitGuestMode,
    fetchUserProfile,
    isAuthenticated: !!session || isGuest
  }
}