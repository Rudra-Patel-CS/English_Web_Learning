'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  FileText, 
  Video,
  BookOpen,
  PenTool,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ users: 0, materials: 0, videos: 0, textbooks: 0, tests: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [usrRes, matRes, vidRes, tbRes, ptRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('reading_materials').select('id', { count: 'exact', head: true }),
        supabase.from('video_links').select('id', { count: 'exact', head: true }),
        supabase.from('text_books').select('id', { count: 'exact', head: true }),
        supabase.from('practice_tests').select('id', { count: 'exact', head: true }),
      ])
      setCounts({
        users: usrRes.count || 0,
        materials: (matRes.count || 0) + (tbRes.count || 0),
        videos: vidRes.count || 0,
        textbooks: tbRes.count || 0,
        tests: ptRes.count || 0,
      })
      setLoading(false)
    }
    fetchData()
  }, [])

  const formatCount = (n: number) => (n > 0 ? `${n}+` : '0')

  const stats = [
    { icon: Users, label: 'Students Logged In', value: formatCount(counts.users), color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
    { icon: FileText, label: 'Total Material Uploaded', value: formatCount(counts.materials), color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
    { icon: PenTool, label: 'Practice Tests Available', value: formatCount(counts.tests), color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
    { icon: Video, label: 'Video Links Available', value: formatCount(counts.videos), color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
  ]

  return (
    <div className="min-h-screen">
      <AdminHeader title="Admin Dashboard" subtitle="Manage your English learning platform" />
      
      <div className="p-6 space-y-8">
        {/* Welcome Banner with 3D Elements */}
        <div className="relative rounded-2xl overflow-hidden animated-gradient-bg p-8 md:p-10">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 right-8 animate-float opacity-40 hidden md:block">
              <div className="threed-pencil" style={{ transform: 'rotate(-30deg) scale(0.6)' }} />
            </div>
            <div className="absolute bottom-4 right-28 animate-float-slow opacity-30 hidden lg:block">
              <div className="threed-book" style={{ transform: 'perspective(500px) rotateY(-15deg) scale(0.5)' }} />
            </div>
            <div className="absolute top-8 left-[55%] w-5 h-5 rounded-full bg-blue-400/20 animate-float delay-300" />
            <div className="absolute bottom-6 left-[35%] w-7 h-7 rounded-full bg-purple-400/15 animate-float-reverse delay-500" />
            <div className="absolute top-12 right-[45%] w-4 h-4 rounded-full bg-emerald-400/20 animate-float-slow delay-200" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Admin Panel</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome to <span className="gradient-text">EnglishMaster</span> Admin
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Manage standards, upload materials, respond to student queries, and monitor platform activity.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className={`stat-card-3d border-0 shadow-md ${stat.bg} overflow-hidden relative`}>
              <CardContent className="p-6">
                {/* Decorative circle */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/30 pointer-events-none" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-3xl font-black text-foreground mb-1">
                    {loading ? '...' : stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="stat-card-3d border-0 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shrink-0">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Platform Overview</h3>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `${counts.users} students, ${counts.materials} materials, ${counts.tests} tests, ${counts.videos} videos`}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card-3d border-0 shadow-md bg-gradient-to-br from-accent/5 to-accent/10">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shrink-0">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Content Management</h3>
                <p className="text-sm text-muted-foreground">
                  Use the sidebar to manage reading materials, textbooks, videos, and tests by standard and unit.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
