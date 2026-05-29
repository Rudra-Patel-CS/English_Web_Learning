'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Info,
  Phone,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student' },
  { icon: GraduationCap, label: 'Standards', href: '/student/standards' },
  { icon: HelpCircle, label: 'Ask Queries', href: '/student/ask-query' },
  { icon: Info, label: 'About Us', href: '/student/about' },
  { icon: Phone, label: 'Contact Us', href: '/student/contact' },
]

interface StudentSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function StudentSidebar({ mobileOpen = false, onMobileClose }: StudentSidebarProps = {}) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const previousPathname = useRef(pathname)

  // Check if we're on desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Close mobile menu on route change only when pathname actually changes
  useEffect(() => {
    if (pathname !== previousPathname.current && mobileOpen && onMobileClose) {
      onMobileClose()
    }
    previousPathname.current = pathname
  }, [pathname, mobileOpen, onMobileClose])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="mobile-overlay fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-64',
        )}
        data-mobile-open={mobileOpen ? 'true' : 'false'}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/student" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
                <BookOpen className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="text-lg font-semibold text-sidebar-foreground">
                  EnglishMaster
                </span>
              )}
            </Link>
            <div className="flex items-center gap-1">
              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
                onClick={onMobileClose}
              >
                <X className="h-4 w-4" />
              </Button>
              {/* Desktop Collapse Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/student' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={async () => {
                await logout()
                window.location.href = '/'
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
