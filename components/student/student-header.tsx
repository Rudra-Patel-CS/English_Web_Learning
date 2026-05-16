'use client'

import { useState } from 'react'
import { Bell, Search, User, Settings, LogOut, Mail, BookOpen, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'

interface StudentHeaderProps {
  title: string
  subtitle?: string
}

export function StudentHeader({ title, subtitle }: StudentHeaderProps) {
  const { user, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search materials..."
              className="w-64 pl-9 h-9"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
              2
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name} />}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm font-medium max-w-[150px] truncate">
                  {user?.name || 'Student'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-medium text-sm leading-none truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsProfileOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/10"
                onSelect={async () => {
                  await logout()
                  window.location.href = '/'
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
            <DialogDescription>
              View your account details and learning standard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-6">
            <Avatar className="h-24 w-24 border-4 border-stone-100 shadow-sm">
              {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {user ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center text-center space-y-1 w-full">
              <h3 className="text-2xl font-semibold font-serif text-foreground truncate w-full px-4">{user?.name}</h3>
              <div className="flex items-center text-muted-foreground bg-stone-100 px-3 py-1 rounded-full text-sm mt-2">
                <Mail className="h-3.5 w-3.5 mr-2" />
                <span className="truncate max-w-[200px]">{user?.email}</span>
              </div>
              <div className="flex items-center text-amber-800 bg-amber-50 px-3 py-1 rounded-full text-sm mt-2 border border-amber-100">
                <BookOpen className="h-3.5 w-3.5 mr-2" />
                <span className="font-medium">Standard {user?.standard || 'Not set'}</span>
              </div>
              <div className="flex items-center text-stone-600 bg-stone-100 px-3 py-1 rounded-full text-sm mt-2">
                <Calendar className="h-3.5 w-3.5 mr-2" />
                <span>Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
