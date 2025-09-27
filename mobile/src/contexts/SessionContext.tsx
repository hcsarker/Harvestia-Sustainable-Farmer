import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setIsGuest(false);
  };

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });
    if (error) throw error;
    setIsGuest(false);
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
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
      setIsGuest(true);
    }, 2000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setSession(session);
      setIsGuest(!session);
      setLoading(false);
    }).catch((error) => {
      console.error('Session error:', error);
      clearTimeout(timeout);
      setLoading(false);
      setIsGuest(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsGuest(!session);
    });

    return () => {
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
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
