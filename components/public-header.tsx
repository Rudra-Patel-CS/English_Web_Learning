'use client'

import Link from 'next/link'
import { BookOpen, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 gap-2 sm:gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-lg bg-primary shrink-0">
            <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-primary-foreground" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground hidden sm:inline">EnglishMaster</span>
        </Link>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
          <Button variant="ghost" asChild className="text-sm">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild className="text-sm">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-1.5 sm:p-2 rounded-md hover:bg-muted flex-shrink-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-3 py-3 sm:py-4 flex flex-col gap-2">
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild className="w-full text-sm">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild className="w-full text-sm">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
