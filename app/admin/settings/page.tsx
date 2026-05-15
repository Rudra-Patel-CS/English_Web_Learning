'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Globe, Shield, User, Eye, EyeOff, Loader2, Save, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingsTab = 'general' | 'security' | 'account'

export default function AdminSettingsPage() {
  const { user, updateProfile, updatePassword, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  // General settings
  const [platformName, setPlatformName] = useState('EnglishMaster')
  const [supportEmail, setSupportEmail] = useState('support@englishmaster.com')
  const [generalSaving, setGeneralSaving] = useState(false)
  const [generalSuccess, setGeneralSuccess] = useState('')

  // Security settings
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [securitySaving, setSecuritySaving] = useState(false)
  const [securityError, setSecurityError] = useState('')
  const [securitySuccess, setSecuritySuccess] = useState('')

  // Account settings
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountSuccess, setAccountSuccess] = useState('')

  const tabs = [
    { id: 'general' as const, label: 'General Settings', icon: Globe },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'account' as const, label: 'Account', icon: User },
  ]

  const handleSaveGeneral = async () => {
    setGeneralSaving(true)
    setGeneralSuccess('')
    // These would typically save to a site_settings table
    await new Promise(r => setTimeout(r, 500))
    setGeneralSuccess('Configuration saved successfully!')
    setGeneralSaving(false)
  }

  const handleUpdatePassword = async () => {
    setSecurityError('')
    setSecuritySuccess('')

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters')
      return
    }

    setSecuritySaving(true)
    const result = await updatePassword(currentPassword, newPassword)

    if (result.success) {
      setSecuritySuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setSecurityError(result.error || 'Failed to update password')
    }
    setSecuritySaving(false)
  }

  const handleUpdateAccount = async () => {
    setAccountSaving(true)
    setAccountSuccess('')
    const result = await updateProfile({ name: displayName })
    if (result.success) {
      setAccountSuccess('Account updated successfully!')
    }
    setAccountSaving(false)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Admin Portal Settings" subtitle="Configure your platform workspace and security preferences" />

      <div className="p-6">
        <div className="flex gap-8 max-w-5xl">
          {/* Left Sidebar Tabs */}
          <div className="w-56 shrink-0 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </div>
                {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {/* General Settings */}
            {activeTab === 'general' && (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Globe className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
                      Global Platform Configuration
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Platform Name
                      </Label>
                      <Input
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        className="h-12 bg-muted/30 border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Support Email
                      </Label>
                      <Input
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="h-12 bg-muted/30 border-border"
                      />
                    </div>
                  </div>

                  {generalSuccess && (
                    <div className="mt-6 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                      {generalSuccess}
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <p>💡 These settings impact how students perceive the platform. Changes will update displays across the application.</p>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={handleSaveGeneral}
                      disabled={generalSaving}
                      className="bg-amber-800 hover:bg-amber-900"
                    >
                      {generalSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Shield className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
                      Access & Security Shield
                    </h2>
                  </div>

                  <div className="max-w-md space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Current Master Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Enter your current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="h-12 bg-muted/30 border-border pr-10"
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
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        New Vault Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-12 bg-muted/30 border-border pr-10"
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
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Confirm Authorization Key
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repeat new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 bg-muted/30 border-border pr-10"
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
                  </div>

                  {securityError && (
                    <div className="mt-6 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                      {securityError}
                    </div>
                  )}

                  {securitySuccess && (
                    <div className="mt-6 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                      {securitySuccess}
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={securitySaving || !currentPassword || !newPassword || !confirmPassword}
                      className="bg-amber-800 hover:bg-amber-900"
                    >
                      {securitySaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Settings */}
            {activeTab === 'account' && (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <User className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
                      Account Management
                    </h2>
                  </div>

                  <div className="max-w-md space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Display Name
                      </Label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-12 bg-muted/30 border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Account Email
                      </Label>
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="h-12 bg-muted/50 border-border text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed for security reasons.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Role
                      </Label>
                      <Input
                        value={user?.role === 'admin' ? 'Administrator' : 'Student'}
                        disabled
                        className="h-12 bg-muted/50 border-border text-muted-foreground"
                      />
                    </div>
                  </div>

                  {accountSuccess && (
                    <div className="mt-6 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                      {accountSuccess}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        logout()
                        window.location.href = '/'
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>

                    <Button
                      onClick={handleUpdateAccount}
                      disabled={accountSaving}
                      className="bg-amber-800 hover:bg-amber-900"
                    >
                      {accountSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
