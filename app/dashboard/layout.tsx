'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { StudentSidebar } from '@/components/student/student-sidebar'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin')
    } else if (!isLoading && user?.role === 'admin') {
      router.push('/admin')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!user || user.role === 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      
      {/* Mobile Header - Always visible and clickable */}
      <div className="mobile-header lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b border-border flex items-center px-4 gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-foreground flex-shrink-0"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">EnglishMaster</h1>
      </div>

      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  )
}
