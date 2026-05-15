'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, ExternalLink, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { TextBook } from '@/lib/types'

export default function StudentTextbooksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [textbooks, setTextbooks] = useState<TextBook[]>([])
  const [standardName, setStandardName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: stdData } = await supabase.from('standards').select('name').eq('id', id).single()
      if (stdData) setStandardName(stdData.name)

      const { data } = await supabase
        .from('text_books')
        .select('*')
        .eq('standard_id', id)
        .order('created_at', { ascending: false })

      if (data) setTextbooks(data)
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
        ) : textbooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Textbooks Yet</h3>
            <p className="text-muted-foreground">Textbooks for this standard will appear here once added.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {textbooks.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mb-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{book.title}</h3>
                  {book.author && <p className="text-sm text-muted-foreground mb-1">By {book.author}</p>}
                  {book.chapter && <p className="text-xs text-muted-foreground mb-3">Chapter: {book.chapter}</p>}
                  {book.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{book.description}</p>}
                  <Button asChild className="w-full" variant="outline">
                    <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Textbook
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
