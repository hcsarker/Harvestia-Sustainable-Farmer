import { useState, useEffect } from 'react'
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          setIsGuest(false)
          // Fetch user profile
          setTimeout(async () => {
            await fetchUserProfile(session.user.id)
          }, 0)
        } else {
          setProfile(null)
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
      }
      
      setLoading(false)
    })

    // Check for guest mode
    const guestMode = localStorage.getItem('guest_mode')
    if (guestMode === 'true' && !session) {
      setIsGuest(true)
      setLoading(false)
    }

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signOut = async () => {
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