'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, Loader2, FolderOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Standard } from '@/lib/types'

const standardColors = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-orange-600',
]

const standardDescriptions: Record<number, string> = {
  6: 'Foundation English — Basic grammar, simple comprehension, vocabulary building',
  7: 'Intermediate grammar, paragraph writing, reading comprehension',
  8: 'Advanced grammar concepts, essay writing, literature introduction',
  9: 'Complex grammar, creative writing, prose and poetry analysis',
  10: 'Board exam preparation, comprehensive grammar, writing mastery',
  11: 'Advanced literature, critical analysis, professional writing',
  12: 'Board exam prep, advanced comprehension, essay mastery',
}

export default function StudentStandardsPage() {
  const [standards, setStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStandards = async () => {
      const { data } = await supabase.from('standards').select('*').order('grade_number')
      if (data) setStandards(data)
      setLoading(false)
    }
    fetchStandards()
  }, [])

  return (
    <div className="min-h-screen">
      <StudentHeader title="Standards" subtitle="Choose your standard to access study materials" />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-8">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 -right-12 md:right-10 animate-float opacity-15 md:opacity-30 scale-[0.35] md:scale-100 origin-right">
              <div className="threed-pencil" style={{ transform: 'rotate(-25deg) scale(0.5)' }} />
            </div>
            <div className="absolute top-6 right-[40%] w-4 h-4 rounded-full bg-primary/20 animate-float-slow" />
            <div className="absolute bottom-4 right-[30%] w-6 h-6 rounded-full bg-accent/15 animate-float-reverse" />
          </div>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Select Your Standard</h2>
              <p className="text-sm text-muted-foreground">Click on any standard to access reading materials, textbooks, practice tests, and video links</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : standards.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Standards Available</h3>
            <p className="text-muted-foreground">Standards will appear here once added by the admin.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {standards.map((std, i) => (
              <Link key={std.id} href={`/student/standard/${std.id}`}>
                <Card className="resource-block cursor-pointer border-0 shadow-md hover:shadow-xl h-full overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${standardColors[i % standardColors.length]} p-6 text-white`}>
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                        <span className="text-3xl font-black">{std.grade_number}</span>
                      </div>
                      <h3 className="text-xl font-bold">{std.name}</h3>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {std.description || standardDescriptions[std.grade_number] || 'Comprehensive English learning resources'}
                      </p>
                      <div className="mt-4 text-xs font-medium text-primary flex items-center gap-1">
                        View Resources →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
