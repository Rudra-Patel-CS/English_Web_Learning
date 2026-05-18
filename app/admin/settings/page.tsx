'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Shield, User, Eye, EyeOff, Loader2, Save, LogOut, Lock, Key, QrCode, CheckCircle2, XCircle } from 'lucide-react'

export default function SystemSecurityPage() {
  const { user, updateProfile, updateEmail, updateNotificationEmail, updatePassword, logout, enrollMfa, verifyMfa, challengeMfa, unenrollMfa } = useAuth()
  
  // Lock screen
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [unlockPassword, setUnlockPassword] = useState('')
  const [showUnlockPassword, setShowUnlockPassword] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')

  // Profile settings
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [displayEmail, setDisplayEmail] = useState(user?.email || '')
  const [notificationEmail, setNotificationEmail] = useState(user?.notification_email || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [notificationSaving, setNotificationSaving] = useState(false)
  const [notificationSuccess, setNotificationSuccess] = useState('')
  const [notificationError, setNotificationError] = useState('')

  // Password settings
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // MFA settings
  const [mfaStatus, setMfaStatus] = useState<'loading' | 'disabled' | 'setup' | 'enabled'>('loading')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [factorId, setFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [mfaSaving, setMfaSaving] = useState(false)
  const [mfaError, setMfaError] = useState('')
  const [mfaSuccess, setMfaSuccess] = useState('')

  useEffect(() => {
    checkMfaStatus()
  }, [])

  useEffect(() => {
    setDisplayName(user?.name || '')
    setDisplayEmail(user?.email || '')
    setNotificationEmail(user?.notification_email || '')
  }, [user])

  const checkMfaStatus = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (data?.totp && data.totp.length > 0 && data.totp[0].status === 'verified') {
      setMfaStatus('enabled')
      setFactorId(data.totp[0].id)
    } else {
      setMfaStatus('disabled')
    }
  }

  const handleUpdateProfile = async () => {
    setProfileError('')
    setProfileSuccess('')
    if (!displayName.trim()) {
      setProfileError('Username cannot be empty')
      return
    }

    setProfileSaving(true)
    const result = await updateProfile({ name: displayName })
    if (result.success) {
      setProfileSuccess('Username updated successfully!')
    } else {
      setProfileError(result.error || 'Failed to update username')
    }
    setProfileSaving(false)
  }

  const handleUpdateEmail = async () => {
    setProfileError('')
    setProfileSuccess('')
    setNotificationError('')
    setNotificationSuccess('')
    if (!displayEmail.trim() || !displayEmail.includes('@')) {
      setProfileError('Please enter a valid email address')
      return
    }

    setProfileSaving(true)
    const result = await updateEmail(displayEmail)
    if (result.success) {
      if (result.pending) {
        setProfileSuccess('Confirmation link sent! Please check your new inbox to verify and complete the change.')
      } else {
        setProfileSuccess('Email updated successfully!')
      }
    } else {
      setProfileError(result.error || 'Failed to update email')
    }
    setProfileSaving(false)
  }

  const handleUpdateNotificationEmail = async () => {
    setNotificationError('')
    setNotificationSuccess('')

    if (notificationEmail.trim() && !notificationEmail.includes('@')) {
      setNotificationError('Please enter a valid notification email address')
      return
    }

    setNotificationSaving(true)
    const result = await updateNotificationEmail(notificationEmail)
    if (result.success) {
      setNotificationSuccess('Notification email saved successfully!')
    } else {
      setNotificationError(result.error || 'Failed to save notification email')
    }
    setNotificationSaving(false)
  }

  const handleUpdatePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword) {
      setPasswordError('Old password is required')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    setPasswordSaving(true)
    const result = await updatePassword(currentPassword, newPassword)

    if (result.success) {
      setPasswordSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setPasswordError(result.error || 'Failed to update password')
    }
    setPasswordSaving(false)
  }

  const startMfaSetup = async () => {
    setMfaError('')
    setMfaStatus('loading')
    const enrollRes = await enrollMfa()
    if (enrollRes.success && enrollRes.factorId && enrollRes.qrCodeUrl) {
      // Use Google Chart API or QR Server API to generate QR image URL from the totp URI
      // The enrollRes.qrCodeUrl is actually an SVG string usually from Supabase, but if it's a URI we can encode it.
      // Supabase actually returns an SVG string in `qr_code`.
      setQrCodeUrl(enrollRes.qrCodeUrl) 
      setFactorId(enrollRes.factorId)
      
      const challengeRes = await challengeMfa(enrollRes.factorId)
      if (challengeRes.success && challengeRes.challengeId) {
        setChallengeId(challengeRes.challengeId)
        setMfaStatus('setup')
      } else {
        setMfaStatus('disabled')
        setMfaError(challengeRes.error || 'Failed to start MFA setup.')
      }
    } else {
       setMfaStatus('disabled')
       setMfaError(enrollRes.error || 'Failed to enroll MFA.')
    }
  }

  const confirmMfaSetup = async () => {
    setMfaError('')
    setMfaSuccess('')
    setMfaSaving(true)
    const verifyRes = await verifyMfa(factorId, challengeId, mfaCode)
    if (verifyRes.success) {
      setMfaStatus('enabled')
      setMfaSuccess('Two-Factor Authentication is now actively protecting your account!')
      setMfaCode('')
    } else {
      setMfaError(verifyRes.error || 'Invalid authentication code. Please try again.')
    }
    setMfaSaving(false)
  }

  const disableMfa = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) return
    
    setMfaError('')
    setMfaSuccess('')
    setMfaSaving(true)
    const res = await unenrollMfa(factorId)
    if (res.success) {
      setMfaStatus('disabled')
      setFactorId('')
      setMfaSuccess('Two-Factor Authentication has been successfully disabled.')
    } else {
      setMfaError(res.error || 'Failed to disable 2FA.')
    }
    setMfaSaving(false)
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setUnlockError('')
    setUnlocking(true)
    
    const { data: { session } } = await supabase.auth.getSession()
    const trueAuthEmail = session?.user?.email

    if (!trueAuthEmail) {
       setUnlockError('Authentication session not found')
       setUnlocking(false)
       return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trueAuthEmail,
      password: unlockPassword
    })

    if (error) {
      setUnlockError('Incorrect password. Access denied.')
    } else {
      setIsUnlocked(true)
    }
    setUnlocking(false)
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AdminHeader title="Security Check" subtitle="Authentication required to view settings" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-lg border-muted/60">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Settings Locked</h2>
                  <p className="text-muted-foreground text-sm mt-1">Please enter your current administrative password to unlock system settings.</p>
                </div>
              </div>

              <form onSubmit={handleUnlock} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showUnlockPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={unlockPassword}
                      onChange={(e) => setUnlockPassword(e.target.value)}
                      className="h-14 bg-[#faf9f7] border-border/60 pr-10 font-medium text-lg text-center tracking-widest"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showUnlockPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {unlockError && <p className="text-sm text-red-600 font-medium text-center">{unlockError}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={unlocking || !unlockPassword}
                  style={{ backgroundColor: '#171717', color: '#ffffff', border: '1px solid #0a0a0a' }}
                  className="w-full h-12 text-[15px]"
                >
                  {unlocking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Unlock Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12 bg-background">
      <AdminHeader title="System Security" subtitle="Manage your credentials and secure your administrative access" />

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Identity Section */}
          <Card className="shadow-sm border-muted/60">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
                <User className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">Identity Management</h2>
              </div>

              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Administrator Username
                  </Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 bg-[#faf9f7] border-border/60 font-medium"
                    autoComplete="off"
                  />
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={profileSaving}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #1d4ed8' }}
                    className="shadow-sm mt-2"
                  >
                    {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Update Username
                  </Button>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/40">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Administrator Email
                  </Label>
                  <Input
                    value={displayEmail}
                    onChange={(e) => setDisplayEmail(e.target.value)}
                    type="email"
                    className="h-12 bg-[#faf9f7] border-border/60 font-medium"
                    autoComplete="off"
                  />
                  <Button
                    onClick={handleUpdateEmail}
                    disabled={profileSaving}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #1d4ed8' }}
                    className="shadow-sm mt-2"
                  >
                    {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Update Email
                  </Button>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/40">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Notification Email
                  </Label>
                  <Input
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    type="email"
                    className="h-12 bg-[#faf9f7] border-border/60 font-medium"
                    autoComplete="off"
                  />
                  <p className="text-sm text-muted-foreground">Student queries will be routed to this address. Leave blank to use the admin login email.</p>
                  <Button
                    onClick={handleUpdateNotificationEmail}
                    disabled={notificationSaving}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #1d4ed8' }}
                    className="shadow-sm mt-2"
                  >
                    {notificationSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Notification Email
                  </Button>
                </div>
                
                {profileError && <p className="text-sm text-red-600 font-medium pt-2">{profileError}</p>}
                {notificationError && <p className="text-sm text-red-600 font-medium pt-2">{notificationError}</p>}
                {profileSuccess && <p className="text-sm text-green-600 font-medium pt-2">{profileSuccess}</p>}
                {notificationSuccess && <p className="text-sm text-green-600 font-medium pt-2">{notificationSuccess}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="shadow-sm border-muted/60">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
                <Key className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">Access Credentials</h2>
              </div>

              <div className="max-w-md space-y-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Old Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-12 bg-[#faf9f7] border-border/60 pr-10 font-medium"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 bg-[#faf9f7] border-border/60 pr-10 font-medium"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 bg-[#faf9f7] border-border/60 pr-10 font-medium"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && <p className="text-sm text-red-600 font-medium">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm text-green-600 font-medium">{passwordSuccess}</p>}

                <Button
                  onClick={handleUpdatePassword}
                  disabled={passwordSaving}
                  style={{ backgroundColor: '#d97706', color: '#ffffff', border: '1px solid #b45309' }}
                  className="shadow-sm"
                >
                  {passwordSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* MFA Section */}
          <Card className="shadow-sm border-muted/60">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
                <Shield className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">Two-Factor Authentication</h2>
              </div>

              {mfaStatus === 'loading' ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" /> Checking security status...
                </div>
              ) : mfaStatus === 'enabled' ? (
                <div className="space-y-6">
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-bold text-emerald-900">Your account is secure!</h3>
                      <p className="text-sm text-emerald-800/80 mt-1">
                        Two-Factor Authentication (Google Authenticator) is actively required for every login attempt.
                      </p>
                    </div>
                  </div>
                  {mfaSuccess && <p className="text-sm text-green-600 font-medium">{mfaSuccess}</p>}
                  {mfaError && <p className="text-sm text-red-600 font-medium">{mfaError}</p>}
                  <Button
                    onClick={disableMfa}
                    disabled={mfaSaving}
                    variant="outline"
                    style={{ color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
                  >
                    {mfaSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                    Disable 2FA Protection
                  </Button>
                </div>
              ) : mfaStatus === 'setup' ? (
                <div className="space-y-6">
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="font-bold text-blue-900 mb-2">Step 1: Scan QR Code</h3>
                    <p className="text-sm text-blue-800/80 mb-4">
                      Open Google Authenticator on your mobile device and scan the QR code below.
                    </p>
                    <div className="bg-white p-4 inline-block rounded-lg shadow-sm mb-2" dangerouslySetInnerHTML={{ __html: qrCodeUrl }} />
                  </div>

                  <div className="max-w-xs space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Step 2: Enter 6-Digit Code
                    </Label>
                    <Input
                      placeholder="e.g. 123456"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-12 text-lg tracking-[0.2em] font-mono font-medium text-center"
                      maxLength={6}
                    />
                    
                    {mfaError && <p className="text-sm text-red-600 font-medium">{mfaError}</p>}
                    
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={confirmMfaSetup}
                        disabled={mfaSaving || mfaCode.length !== 6}
                        style={{ backgroundColor: '#059669', color: '#ffffff', border: '1px solid #047857' }}
                        className="flex-1 shadow-sm"
                      >
                        {mfaSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                        Verify & Enable
                      </Button>
                      <Button
                        onClick={() => setMfaStatus('disabled')}
                        variant="ghost"
                        disabled={mfaSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-5 bg-muted/30 border border-border/50 rounded-xl flex items-start gap-4">
                    <QrCode className="h-6 w-6 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-bold text-foreground">Protect your administrative access</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use an authenticator app like Google Authenticator to get a 6-digit code every time you sign in. This prevents unauthorized access even if your password is compromised.
                      </p>
                    </div>
                  </div>
                  
                  {mfaError && <p className="text-sm text-red-600 font-medium">{mfaError}</p>}
                  
                  <Button
                    onClick={startMfaSetup}
                    style={{ backgroundColor: '#171717', color: '#ffffff', border: '1px solid #0a0a0a' }}
                    className="shadow-sm"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Setup Google Authenticator
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Exit Section */}
          <div className="mt-10 pt-8 border-t border-border/60">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4 ml-1">
              SYSTEM EXIT
            </h3>
            <div className="p-6 bg-red-50/80 border-2 border-red-200/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="pl-2">
                <h4 className="text-[16px] font-bold text-red-900">Terminate Active Session</h4>
                <p className="text-[13px] text-red-800/80 mt-1 font-medium">Safely log out from the administrative dashboard.</p>
              </div>
              <Button
                variant="destructive"
                style={{ backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c' }}
                className="font-bold px-8 py-6 h-auto shadow-md transition-all whitespace-nowrap text-[15px]"
                onClick={async () => {
                  await logout()
                  window.location.href = '/'
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout Now
              </Button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
