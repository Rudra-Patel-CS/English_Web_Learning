'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; requireMfa?: boolean; mfaFactorId?: string; error?: string }>
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: { name?: string }) => Promise<{ success: boolean; error?: string }>
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  enrollMfa: () => Promise<{ success: boolean; qrCodeUrl?: string; secret?: string; factorId?: string; error?: string }>
  verifyMfa: (factorId: string, challengeId: string, code: string) => Promise<{ success: boolean; error?: string }>
  challengeMfa: (factorId: string) => Promise<{ success: boolean; challengeId?: string; error?: string }>
  unenrollMfa: (factorId: string) => Promise<{ success: boolean; error?: string }>
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
      // Check MFA requirement
      const mfaFactors = await supabase.auth.mfa.listFactors()
      const totpFactor = mfaFactors.data?.totp?.[0]
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      
      const requireMfa = totpFactor?.status === 'verified' && aalData?.currentLevel === 'aal1' && aalData?.nextLevel === 'aal2'

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
        if (!requireMfa) {
          setUser(profile)
        }
        setIsLoading(false)
        return { 
          success: true, 
          role: profile.role, 
          requireMfa, 
          mfaFactorId: requireMfa ? totpFactor?.id : undefined 
        }
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

  const updateEmail = async (newEmail: string): Promise<{ success: boolean; error?: string; pending?: boolean }> => {
    if (!user) return { success: false, error: 'Not authenticated' }

    // Update in Supabase Auth
    const { data, error: authError } = await supabase.auth.updateUser({ email: newEmail })
    if (authError) return { success: false, error: authError.message }

    // If Supabase requires email confirmation, it sets `new_email` but keeps the old `email`.
    if (data?.user?.new_email && data.user.email !== newEmail.toLowerCase()) {
      return { success: true, pending: true }
    }

    // If no confirmation is required (changed immediately), update the public users table
    const { error: dbError } = await supabase
      .from('users')
      .update({ email: newEmail.toLowerCase(), updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (dbError) return { success: false, error: dbError.message }

    setUser(prev => prev ? { ...prev, email: newEmail.toLowerCase() } : null)
    return { success: true, pending: false }
  }

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' }

    // Fetch the true auth email to prevent mismatches if public profile is out of sync
    const { data: { session } } = await supabase.auth.getSession()
    const trueAuthEmail = session?.user?.email

    if (!trueAuthEmail) return { success: false, error: 'Authentication session not found' }

    // First verify current password by re-signing in (Legacy check, kept for older GoTrue versions)
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: trueAuthEmail,
      password: currentPassword,
    })

    if (verifyError) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword, // Required for newer Supabase projects
    } as any)

    if (error) return { success: false, error: error.message }

    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const enrollMfa = async () => {
    // Clean up any stale unverified factors so we can generate a new QR code
    const { data: factors } = await supabase.auth.mfa.listFactors()
    if (factors?.totp) {
      for (const factor of factors.totp) {
        if (factor.status === 'unverified') {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error) return { success: false, error: error.message }
    return { 
      success: true, 
      qrCodeUrl: data.totp.qr_code, 
      secret: data.totp.secret,
      factorId: data.id 
    }
  }

  const challengeMfa = async (factorId: string) => {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId })
    if (error) return { success: false, error: error.message }
    return { success: true, challengeId: data.id }
  }

  const verifyMfa = async (factorId: string, challengeId: string, code: string) => {
    const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
    if (error) return { success: false, error: error.message }
    
    // User is now aal2 verified, we can set them in context if needed
    if (data.user) {
       const profile = await fetchUserProfile(data.user.id)
       if (profile) setUser(profile)
    }
    
    return { success: true }
  }

  const unenrollMfa = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, signInWithGoogle, 
      updateProfile, updateEmail, updatePassword, logout, isLoading,
      enrollMfa, verifyMfa, challengeMfa, unenrollMfa
    }}>
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
