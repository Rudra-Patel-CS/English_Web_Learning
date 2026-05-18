'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, ExternalLink, Download, Loader2, GraduationCap, FolderOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { TextBook, Unit } from '@/lib/types'

export default function StudentTextbooksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [textbooks, setTextbooks] = useState<TextBook[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [standardName, setStandardName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: stdData } = await supabase.from('standards').select('name').eq('id', id).single()
      if (stdData) setStandardName(stdData.name)

      const [tbRes, unitsRes] = await Promise.all([
        supabase
          .from('text_books')
          .select('*')
          .eq('standard_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('units')
          .select('*')
          .eq('standard_id', id)
          .order('unit_number')
      ])

      if (tbRes.data) setTextbooks(tbRes.data)
      if (unitsRes.data) setUnits(unitsRes.data)
      setLoading(false)
    }
    fetchData()
  }, [id])

  return (
    <div className="min-h-screen">
      <StudentHeader title="Textbooks" subtitle={`${standardName} — Browse available textbooks`} />

      <div className="p-6 space-y-6">
        <Link href={`/student/standard/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to {standardName}
        </Link>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Static Unit/Chapters Outline */}
            <div className="lg:col-span-1">
              <Card className="border border-border shadow-sm">
                <CardContent className="p-5">
                  <h3 className="text-base font-bold flex items-center gap-2 mb-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Syllabus Units Outline
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Static reference list of syllabus chapters/units in {standardName} to follow along with the textbooks.
                  </p>
                  {units.length === 0 ? (
                    <div className="text-center py-8 bg-muted/40 rounded-lg">
                      <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground">No units defined yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                      {units.map((u) => (
                        <div key={u.id} className="p-3 rounded-lg border border-border bg-card/60 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{u.unit_number}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate text-foreground">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">Unit {u.unit_number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Direct Textbook Access */}
            <div className="lg:col-span-2 space-y-4">
              {textbooks.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Textbooks Yet</h3>
                  <p className="text-muted-foreground text-sm">Textbooks for this standard will appear here once added.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {textbooks.map((book) => (
                    <Card key={book.id} className="group hover:shadow-lg hover:border-primary/30 transition-all border border-border">
                      <CardContent className="p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mb-4">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{book.title}</h3>
                        {book.author && <p className="text-sm text-muted-foreground mb-1">By {book.author}</p>}
                        {book.chapter && <p className="text-xs text-muted-foreground mb-3">Chapter: {book.chapter}</p>}
                        {book.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{book.description}</p>}
                        <div className="flex gap-2 mt-2">
                          <Button asChild className="flex-1 text-xs" variant="outline">
                            <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Read
                            </a>
                          </Button>
                          <Button asChild className="flex-1 text-xs">
                            <a href={book.file_url?.includes('supabase.co') ? `${book.file_url}?download=` : book.file_url} target="_blank" rel="noopener noreferrer" download>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
