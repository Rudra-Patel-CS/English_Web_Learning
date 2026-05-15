'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Video, FileText, PenTool, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Standard } from '@/lib/types'

export default function StandardsPage() {
  const [standards, setStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('standards').select('*').order('grade_number')
      if (data) setStandards(data)
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Choose Your Standard
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                Select your academic standard to access comprehensive English learning resources designed for your curriculum level.
              </p>
            </div>
          </div>
        </section>

        {/* Standards Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standards.map((standard) => (
                  <Card key={standard.id} className="group hover:shadow-lg transition-all hover:border-primary/30 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium opacity-80">Standard</span>
                            <h2 className="text-4xl font-bold">{standard.grade_number}</h2>
                          </div>
                          <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                            <BookOpen className="h-7 w-7" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{standard.description}</p>
                        
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center p-2 bg-muted/50 rounded-md">
                            <FileText className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">Materials</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded-md">
                            <Video className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">Videos</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded-md">
                            <PenTool className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">Tests</p>
                          </div>
                        </div>

                        <Button asChild className="w-full group-hover:bg-primary">
                          <Link href={`/signin`}>
                            Sign in to Access
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance">
                Ready to Start Learning?
              </h2>
              <p className="text-muted-foreground mb-6">
                Create a free account to unlock all study materials, video tutorials, and practice tests.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/signin">Create Free Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
