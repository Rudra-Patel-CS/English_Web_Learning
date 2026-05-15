'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: { name?: string }) => Promise<{ success: boolean; error?: string }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

interface SignupData {
  name: string
  email: string
  password: string
  standard: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user profile from users table
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return null
    return data as User
  }

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
          }
        }
      } catch {
        // Session expired or invalid
      }
      setIsLoading(false)
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        let profile = await fetchUserProfile(session.user.id)
        
        // Auto-create missing profile (Crucial for Google OAuth sign-ins)
        if (!profile) {
          await supabase.from('users').insert({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Student',
            email: session.user.email?.toLowerCase(),
            role: 'student',
            avatar_url: session.user.user_metadata?.avatar_url,
          })
          profile = await fetchUserProfile(session.user.id)
        }

        if (profile) {
          setUser(profile)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setIsLoading(false)
      return { success: false, error: error.message }
    }

    if (data.user) {
      let profile = await fetchUserProfile(data.user.id)
      
      // If profile is missing (e.g. created in Supabase dashboard or previous signup failed), create it now
      if (!profile) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Student',
          email: data.user.email?.toLowerCase(),
          role: 'student',
        })
        
        if (!profileError) {
          profile = await fetchUserProfile(data.user.id)
        } else {
          setIsLoading(false)
          return { success: false, error: `Database Error: ${profileError.message}` }
        }
      }

      if (profile) {
        setUser(profile)
        setIsLoading(false)
        return { success: true, role: profile.role }
      }
    }

    setIsLoading(false)
    return { success: false, error: 'User profile not found' }
  }

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      setIsLoading(false)
      return { success: false, error: authError.message }
    }

    if (authData.user) {
      // Insert into users table
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        name: data.name,
        email: data.email.toLowerCase(),
        role: 'student',
        standard: data.standard,
      })

      if (profileError) {
        setIsLoading(false)
        return { success: false, error: profileError.message }
      }

      const profile = await fetchUserProfile(authData.user.id)
      if (profile) {
        setUser(profile)
      }
    }

    setIsLoading(false)
    return { success: true }
  }

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect to the sign in page so the client library can exchange the token automatically in the browser
        redirectTo: `${window.location.origin}/signin`,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  const updateProfile = async (data: { name?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
      .from('users')
      .update({ name: data.name, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) return { success: false, error: error.message }

    setUser(prev => prev ? { ...prev, ...data } : null)
    return { success: true }
  }

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' }

    // First verify current password by re-signing in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (verifyError) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) return { success: false, error: error.message }

    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, signInWithGoogle, updateProfile, updatePassword, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
