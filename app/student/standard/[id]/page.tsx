'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, FileText, PenTool, Video, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Standard } from '@/lib/types'

const categories = [
  {
    id: 'reading',
    label: 'Reading Material',
    description: 'Notes, worksheets, and reference documents',
    icon: FileText,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    id: 'textbooks',
    label: 'Textbooks',
    description: 'Access textbook PDFs and study guides',
    icon: BookOpen,
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: 'tests',
    label: 'Practice Tests',
    description: 'Mock tests, previous papers, and quizzes',
    icon: PenTool,
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-500/10 text-orange-600',
  },
  {
    id: 'videos',
    label: 'Video Links',
    description: 'Video tutorials and lecture recordings',
    icon: Video,
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-500/10 text-purple-600',
  },
]

export default function StandardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [standard, setStandard] = useState<Standard | null>(null)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ textbooks: 0, reading: 0, tests: 0, videos: 0 })

  useEffect(() => {
    const fetchData = async () => {
      const { data: stdData } = await supabase
        .from('standards')
        .select('*')
        .eq('id', id)
        .single()

      if (stdData) setStandard(stdData)

      const [tb, rm, pt, vl] = await Promise.all([
        supabase.from('text_books').select('id', { count: 'exact', head: true }).eq('standard_id', id),
        supabase.from('reading_materials').select('id', { count: 'exact', head: true }).eq('standard_id', id),
        supabase.from('practice_tests').select('id', { count: 'exact', head: true }).eq('standard_id', id),
        supabase.from('video_links').select('id', { count: 'exact', head: true }).eq('standard_id', id),
      ])

      setCounts({
        textbooks: tb.count || 0,
        reading: rm.count || 0,
        tests: pt.count || 0,
        videos: vl.count || 0,
      })

      setLoading(false)
    }

    fetchData()
  }, [id])

  const getCount = (catId: string) => {
    switch (catId) {
      case 'textbooks': return counts.textbooks
      case 'reading': return counts.reading
      case 'tests': return counts.tests
      case 'videos': return counts.videos
      default: return 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <StudentHeader
        title={standard?.name || 'Standard'}
        subtitle={standard?.description || 'Select a resource category'}
      />

      <div className="p-6 space-y-6">
        <Link href="/student/standards" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Standards
        </Link>

        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((cat, i) => (
            <Link key={cat.id} href={`/student/standard/${id}/${cat.id}`}>
              <Card className={`resource-block cursor-pointer border-0 shadow-md hover:shadow-xl overflow-hidden h-full`}>
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${cat.gradient} p-8 text-white relative overflow-hidden`}>
                    {/* Decorative circle */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                        <cat.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-1">{cat.label}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                    <span className="text-sm font-semibold text-primary">
                      {getCount(cat.id)} {getCount(cat.id) === 1 ? 'item' : 'items'} available →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
