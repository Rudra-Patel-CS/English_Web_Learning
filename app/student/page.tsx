'use client'

import { useState, useEffect } from 'react'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, FileText, PenTool, Video, Users, GraduationCap, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [counts, setCounts] = useState({ materials: 0, textbooks: 0, tests: 0, videos: 0, standards: 0 })

  useEffect(() => {
    const fetchCounts = async () => {
      const [matRes, tbRes, ptRes, vlRes, stdRes] = await Promise.all([
        supabase.from('reading_materials').select('id', { count: 'exact', head: true }),
        supabase.from('text_books').select('id', { count: 'exact', head: true }),
        supabase.from('practice_tests').select('id', { count: 'exact', head: true }),
        supabase.from('video_links').select('id', { count: 'exact', head: true }),
        supabase.from('standards').select('id', { count: 'exact', head: true }),
      ])
      setCounts({
        materials: matRes.count || 0,
        textbooks: tbRes.count || 0,
        tests: ptRes.count || 0,
        videos: vlRes.count || 0,
        standards: stdRes.count || 0,
      })
    }
    fetchCounts()
  }, [])

  const stats = [
    { icon: FileText, label: 'Reading Materials', value: `${counts.materials}+`, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
    { icon: BookOpen, label: 'Textbooks', value: `${counts.textbooks}+`, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
    { icon: PenTool, label: 'Practice Tests', value: `${counts.tests}+`, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
    { icon: Video, label: 'Video Links', value: `${counts.videos}+`, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
  ]

  return (
    <div className="min-h-screen">
      <StudentHeader title="Dashboard" subtitle={`Welcome back, ${user?.name || 'Student'}!`} />

      <div className="p-6 space-y-8">
        {/* Welcome Banner with 3D Elements */}
        <div className="relative rounded-2xl overflow-hidden animated-gradient-bg p-8 md:p-10">
          {/* Floating decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 right-8 animate-float opacity-40 hidden md:block">
              <div className="threed-pencil" style={{ transform: 'rotate(-30deg) scale(0.6)' }} />
            </div>
            <div className="absolute bottom-4 right-24 animate-float-slow opacity-30 hidden md:block">
              <div className="threed-book" style={{ transform: 'perspective(500px) rotateY(-15deg) scale(0.6)' }} />
            </div>
            <div className="absolute top-6 left-[60%] w-5 h-5 rounded-full bg-blue-400/20 animate-float delay-300" />
            <div className="absolute bottom-8 left-[40%] w-7 h-7 rounded-full bg-purple-400/15 animate-float-reverse delay-500" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Your Learning Journey</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Hello, <span className="gradient-text">{user?.name || 'Student'}</span>! 👋
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Continue your English learning journey. Explore standards, study materials, and practice tests.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={stat.label} className={`stat-card-3d border-0 shadow-md ${stat.bg}`}>
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="stat-card-3d border-0 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shrink-0">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{counts.standards} Standards Available</h3>
                <p className="text-sm text-muted-foreground">Browse Standard 6 to 12 with curated resources</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card-3d border-0 shadow-md bg-gradient-to-br from-accent/5 to-accent/10">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shrink-0">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Ask Your Doubts</h3>
                <p className="text-sm text-muted-foreground">Submit queries and get answers from teachers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
