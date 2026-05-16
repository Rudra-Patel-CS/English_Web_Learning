'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Eye, EyeOff, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthProvider, useAuth } from '@/lib/auth-context'

function SignInForm() {
  const router = useRouter()
  const { user, login, signup, signInWithGoogle, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mfaChallenge, setMfaChallenge] = useState<{ required: boolean; factorId?: string }>({ required: false })
  const [mfaCode, setMfaCode] = useState('')
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false)

  useEffect(() => {
    let mounted = true
    if (user) {
      setTimeout(() => {
        if (!mounted) return
        if (user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/student')
        }
      }, 50)
    }
    return () => { mounted = false }
  }, [user, router])

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Signup fields
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const result = await login(loginEmail, loginPassword)
    if (result.success) {
      if (result.requireMfa && result.mfaFactorId) {
        setMfaChallenge({ required: true, factorId: result.mfaFactorId })
        setSuccess('Password accepted. Please enter your 2FA code.')
      } else {
        setLoginEmail('')
        setLoginPassword('')
        if (result.role === 'admin') router.push('/admin')
        else router.push('/student')
      }
    } else {
      setError(result.error || 'Invalid email or password')
    }
  }

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaChallenge.factorId) return
    
    setError('')
    setIsVerifyingMfa(true)
    
    // First we must challenge the factor to get a challengeId
    const { supabase } = await import('@/lib/supabase')
    const challengeRes = await supabase.auth.mfa.challenge({ factorId: mfaChallenge.factorId })
    
    if (challengeRes.error || !challengeRes.data) {
      setError(challengeRes.error?.message || 'Failed to start 2FA challenge')
      setIsVerifyingMfa(false)
      return
    }

    const verifyRes = await supabase.auth.mfa.verify({
      factorId: mfaChallenge.factorId,
      challengeId: challengeRes.data.id,
      code: mfaCode
    })

    if (verifyRes.error) {
      setError('Invalid 2FA code. Please try again.')
      setIsVerifyingMfa(false)
      return
    }

    setSuccess('Verification successful! Redirecting...')
    // We can assume user is now AAL2 verified. Since they are already signed in (AAL1), 
    // the auth context will update naturally, but we should redirect based on their role.
    const profileRes = await supabase.from('users').select('*').eq('id', verifyRes.data.user.id).single()
    if (profileRes.data?.role === 'admin') router.push('/admin')
    else router.push('/student')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!agreeTerms) { setError('Please agree to the Terms & Conditions'); return }
    if (signupPassword.length < 6) { setError('Password must be at least 6 characters'); return }

    const result = await signup({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      standard: '',
    })
    if (result.success) {
      setSuccess('Account created! Redirecting...')
      setSignupName(''); setSignupEmail(''); setSignupPassword('')
      setTimeout(() => router.push('/student'), 1000)
    } else {
      setError(result.error || 'Failed to create account')
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    const result = await signInWithGoogle()
    if (!result.success) setError(result.error || 'Google sign-in failed')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — 3D Decorative Elements */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden animated-gradient-bg">
        {/* Floating 3D elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large pencil */}
          <div className="absolute top-[15%] left-[15%] animate-float">
            <div className="threed-pencil" style={{ transform: 'rotate(-30deg) scale(1.5)' }} />
          </div>

          {/* Book */}
          <div className="absolute top-[35%] right-[15%] animate-float-slow">
            <div className="threed-book" style={{ transform: 'perspective(500px) rotateY(-15deg) scale(1.3)' }} />
          </div>

          {/* Second pencil */}
          <div className="absolute bottom-[20%] left-[30%] animate-float-reverse opacity-60">
            <div className="threed-pencil" style={{ transform: 'rotate(15deg) scale(0.9)' }} />
          </div>

          {/* Floating ABC letters */}
          <div className="absolute top-[12%] right-[30%] animate-float delay-300 opacity-20">
            <span className="text-8xl font-black text-primary/40 select-none">A</span>
          </div>
          <div className="absolute bottom-[30%] right-[25%] animate-float-reverse delay-500 opacity-15">
            <span className="text-7xl font-black text-purple-500/30 select-none">B</span>
          </div>
          <div className="absolute bottom-[15%] left-[55%] animate-float-slow delay-200 opacity-15">
            <span className="text-6xl font-black text-emerald-500/30 select-none">C</span>
          </div>

          {/* Floating circles / dots */}
          <div className="absolute top-[20%] right-[50%] w-8 h-8 rounded-full bg-blue-400/20 animate-float delay-400" />
          <div className="absolute top-[50%] left-[10%] w-12 h-12 rounded-full bg-purple-400/15 animate-float-reverse delay-200" />
          <div className="absolute bottom-[35%] right-[40%] w-6 h-6 rounded-full bg-emerald-400/20 animate-float-slow delay-700" />
          <div className="absolute top-[70%] left-[40%] w-10 h-10 rounded-full bg-amber-400/15 animate-float delay-100" />
          <div className="absolute top-[8%] left-[50%] w-5 h-5 rounded-full bg-pink-400/20 animate-float-slow" />

          {/* Dotted circle decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-2 border-dashed border-primary/8 animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-dashed border-primary/5 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        </div>

        {/* Branding Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 backdrop-blur-sm">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">EnglishMaster</span>
          </div>

          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">English Learning Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Empower Your<br />
              <span className="gradient-text">English Journey</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Master the English language with structured resources, expert video tutorials, and comprehensive practice tests for all academic standards.
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EnglishMaster</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-muted p-1 mb-8">
            <button
              onClick={() => { setActiveTab('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
              {success}
            </div>
          )}

          {/* MFA Verification Form */}
          {mfaChallenge.required && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Two-Factor Authentication</h2>
              <p className="text-muted-foreground mb-6">Enter the 6-digit code from your authenticator app.</p>

              <form onSubmit={handleMfaVerify} className="space-y-6" autoComplete="off">
                <div className="space-y-3">
                  <Label htmlFor="mfa-code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Authenticator Code</Label>
                  <Input 
                    id="mfa-code" 
                    type="text" 
                    placeholder="e.g. 123456" 
                    value={mfaCode} 
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                    required 
                    autoComplete="one-time-code" 
                    className="h-14 text-center text-2xl tracking-[0.25em] font-mono font-medium" 
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isVerifyingMfa || mfaCode.length !== 6}>
                  {isVerifyingMfa ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify Code'}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => { setMfaChallenge({ required: false }); setSuccess(''); setError(''); }}>
                  Back to Login
                </Button>
              </form>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && !mfaChallenge.required && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
              <p className="text-muted-foreground mb-6">Sign in to continue your learning journey.</p>

              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required autoComplete="off" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required autoComplete="new-password" className="h-11 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
                  <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me</Label>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign In'}
                </Button>
              </form>
            </div>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Create an account</h2>
              <p className="text-muted-foreground mb-6">Join our community and start exploring.</p>

              <form onSubmit={handleSignup} className="space-y-4" autoComplete="off">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" type="text" placeholder="Your name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required autoComplete="off" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required autoComplete="off" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required autoComplete="new-password" className="h-11 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(checked) => setAgreeTerms(checked === true)} />
                  <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">I agree to the Terms & Conditions</Label>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : 'Create Account'}
                </Button>
              </form>
            </div>
          )}

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-3 text-muted-foreground">Or continue with</span></div>
            </div>
          </div>

          {/* Google Sign-In */}
          <Button type="button" variant="outline" className="w-full h-11" onClick={handleGoogleSignIn} disabled={isLoading}>
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <AuthProvider>
      <SignInForm />
    </AuthProvider>
  )
}
