'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, PenTool, Clock, Loader2, FileText, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { PracticeTest } from '@/lib/types'

export default function StudentTestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tests, setTests] = useState<PracticeTest[]>([])
  const [standardName, setStandardName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: stdData } = await supabase.from('standards').select('name').eq('id', id).single()
      if (stdData) setStandardName(stdData.name)
      const { data } = await supabase.from('practice_tests').select('*').eq('standard_id', id).eq('is_published', true).order('created_at', { ascending: false })
      if (data) setTests(data)
      setLoading(false)
    }
    fetchData()
  }, [id])

  return (
    <div className="min-h-screen">
      <StudentHeader title="Practice Tests" subtitle={`${standardName} — Take MCQ tests`} />
      <div className="p-6 space-y-6">
        <Link href={`/student/standard/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to {standardName}
        </Link>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16">
            <PenTool className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Practice Tests Yet</h3>
            <p className="text-muted-foreground">Practice tests will appear here once published by the admin.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map(test => (
              <Card key={test.id} className="resource-block hover:shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 mb-4 shadow-lg">
                      <PenTool className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2">{test.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {test.duration_minutes && <Badge variant="secondary" className="text-xs"><Clock className="mr-1 h-3 w-3" />{test.duration_minutes} min</Badge>}
                      {test.total_marks && <Badge variant="secondary" className="text-xs">{test.total_marks} marks</Badge>}
                      {test.questions_count && <Badge variant="outline" className="text-xs"><FileText className="mr-1 h-3 w-3" />{test.questions_count} questions</Badge>}
                    </div>
                  </div>
                  <div className="p-5">
                    {test.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{test.description}</p>}
                    <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                      <Link href={`/student/standard/${id}/tests/${test.id}`}>
                        <Play className="mr-2 h-4 w-4" />Start Test
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
