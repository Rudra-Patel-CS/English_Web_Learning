'use client'

import { StudentSidebar } from '@/components/student/student-sidebar'
import { AuthProvider } from '@/lib/auth-context'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <StudentSidebar />
        <main className="pl-64 transition-all duration-300">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
