'use client'

import { useState } from 'react'
import { StudentSidebar } from '@/components/student/student-sidebar'
import { AuthProvider } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <StudentSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        
        {/* Mobile Header with hamburger menu */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-background/95 backdrop-blur border-b border-border flex items-center px-4 gap-3">
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="text-foreground flex-shrink-0 h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold text-foreground">EnglishMaster</span>
        </div>

        <main className="lg:pl-64 pt-14 lg:pt-0 transition-all duration-300 min-h-screen">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
