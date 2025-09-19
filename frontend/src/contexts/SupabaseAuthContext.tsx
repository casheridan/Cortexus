import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Simple user profile type
export interface UserProfile {
  id: string
  username: string
  email: string
  full_name: string
  role: 'super_admin' | 'admin' | 'supervisor' | 'operator' | 'technician' | 'quality' | 'readonly'
  department?: string
  shift?: string
  phone?: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state - check for existing valid sessions
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setLoading(false)
          return
        }

        if (session?.user) {
          // We have a valid session, load the profile
          setSession(session)
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          // No session, ready for login
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setSession(session)
        setUser(session.user)
        await loadUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token was refreshed, update session but don't reload profile
        setSession(session)
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Load user profile from database using direct fetch (bypassing hanging Supabase client)
  const loadUserProfile = async (userId: string) => {
    try {
      // Use direct fetch with timeout that actually works
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(
        `http://localhost:8000/rest/v1/users?id=eq.${userId}&select=*`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
            'Accept': 'application/vnd.pgrst.object+json',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        }
      )
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data && data.username) {
        setProfile(data as UserProfile)
      } else {
        console.log('No profile data found for user')
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error('Profile load error:', err)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Profile fetch timed out')
      }
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    try {
      // Convert username to email format
      const email = username.includes('@') ? username : `${username}@cortexus.local`
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      // Profile will be loaded by the auth state change listener
      return { error: null }
    } catch (err) {
      console.error('Sign in exception:', err)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  // Role checking helper
  const hasRole = (roles: string[]): boolean => {
    if (!profile) return false
    return roles.includes(profile.role)
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    hasRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
