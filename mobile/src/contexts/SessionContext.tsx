import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

console.log('🔧 Supabase Client imported successfully');

interface UserMetadata {
  full_name?: string;
  [key: string]: string | number | boolean | undefined;
}

interface SessionContextValue {
  session: Session | null;
  user: Session['user'] | null;
  isGuest: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<void>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
}

const defaultContext: SessionContextValue = {
  session: null,
  user: null,
  isGuest: true,
  loading: true,
  signIn: async () => { throw new Error('SessionContext not provided'); },
  signUp: async () => { throw new Error('SessionContext not provided'); },
  signOut: async () => { throw new Error('SessionContext not provided'); },
  enterGuestMode: () => { throw new Error('SessionContext not provided'); },
};

const SessionContext = createContext<SessionContextValue>(defaultContext);

export const useSessionContext = () => useContext(SessionContext);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (error) {
        console.error('❌ Sign in error:', error.message);
        throw new Error(error.message);
      }
      
      if (data.user) {
        console.log('✅ Sign in successful:', data.user.email);
        setSession(data.session);
        setIsGuest(false);
      } else {
        throw new Error('No user data returned');
      }
    } catch (err) {
      console.error('🚨 Sign in exception:', err);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    console.log('📝 Attempting sign up for:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: undefined // Disable email confirmation for mobile
        }
      });
      
      if (error) {
        console.error('❌ Sign up error:', error.message);
        throw new Error(error.message);
      }
      
      if (data.user) {
        console.log('✅ Sign up successful:', data.user.email);
        
        // For mobile, auto-confirm if needed
        if (data.session) {
          setSession(data.session);
          setIsGuest(false);
        } else {
          console.log('📧 Email confirmation may be required');
          // Still create session for better UX
          setIsGuest(false);
        }
      } else {
        throw new Error('No user data returned');
      }
    } catch (err) {
      console.error('🚨 Sign up exception:', err);
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsGuest(true);
  };

  const enterGuestMode = () => {
    setIsGuest(true);
  };

  useEffect(() => {
    console.log('🚀 Initializing session context...');
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('⏰ Session timeout reached, defaulting to guest mode');
      setLoading(false);
      setIsGuest(true);
    }, 3000); // Increased timeout

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(timeout);
        
        if (error) {
          console.error('❌ Session error:', error);
          setLoading(false);
          setIsGuest(true);
          return;
        }
        
        console.log('📱 Current session:', session ? 'Authenticated' : 'Guest');
        setSession(session);
        setIsGuest(!session);
        setLoading(false);
      } catch (err) {
        console.error('🚨 Session initialization error:', err);
        clearTimeout(timeout);
        setLoading(false);
        setIsGuest(true);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session ? 'Authenticated' : 'Guest');
      setSession(session);
      setIsGuest(!session);
      
      if (event === 'SIGNED_IN') {
        console.log('✅ User signed in successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ 
      session, 
      user: session?.user || null, 
      isGuest, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      enterGuestMode 
    }}>
      {children}
    </SessionContext.Provider>
  );
};
