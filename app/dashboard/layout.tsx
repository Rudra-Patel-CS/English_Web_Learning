'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { StudentSidebar } from '@/components/student/student-sidebar'
import { Spinner } from '@/components/ui/spinner'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

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
      <StudentSidebar />
      <main className="pl-64 min-h-screen">
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
