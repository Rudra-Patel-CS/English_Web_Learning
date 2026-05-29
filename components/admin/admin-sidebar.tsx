'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Video,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PenTool,
  ClipboardList,
  HelpCircle,
  Settings,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileText, label: 'Reading Material', href: '/admin/reading' },
  { icon: BookOpen, label: 'Textbooks', href: '/admin/textbooks' },
  { icon: Video, label: 'Video Links', href: '/admin/videos' },
  { icon: PenTool, label: 'Practice Tests', href: '/admin/tests' },
  { icon: ClipboardList, label: 'Generate Paper', href: '/admin/generate-paper' },
  { icon: HelpCircle, label: 'Student Queries', href: '/admin/queries' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

interface AdminSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const previousPathname = useRef(pathname)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    return () => {
      window.removeEventListener('resize', checkDesktop)
    }
  }, [])

  useEffect(() => {
    if (pathname !== previousPathname.current && mobileOpen && onMobileClose) {
      onMobileClose()
    }
    previousPathname.current = pathname
  }, [pathname, mobileOpen, onMobileClose])

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

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="mobile-overlay fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-16' : 'w-64',
        )}
        data-mobile-open={mobileOpen ? 'true' : 'false'}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
                <BookOpen className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>

              {!collapsed && (
                <span className="text-lg font-semibold text-sidebar-foreground">
                  EnglishMaster
                </span>
              )}
            </Link>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
                onClick={onMobileClose}
              >
                <X className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hidden h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent lg:flex"
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
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))

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

          {/* User Info */}
          <div className="border-t border-sidebar-border p-3">
            {!collapsed && user && (
              <div className="mb-2 flex items-center gap-3 px-3 py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                  {user.name?.charAt(0).toUpperCase() || 'A'}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {user.name || 'Admin'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">
                    Administrator
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
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