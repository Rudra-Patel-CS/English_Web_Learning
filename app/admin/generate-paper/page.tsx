'use client'

import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, Sparkles } from 'lucide-react'

export default function GeneratePaperPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader title="Generate Question Paper" subtitle="Auto-generate question papers from your content" />
      <div className="p-6 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-lg w-full border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-purple-50 to-accent/10 p-8 text-center relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-4 right-8 animate-float opacity-30">
                <div className="threed-pencil" style={{ transform: 'rotate(-25deg) scale(0.4)' }} />
              </div>
              <div className="absolute bottom-4 left-8 w-5 h-5 rounded-full bg-primary/15 animate-float-slow" />
            </div>
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow">
                <ClipboardList className="h-10 w-10 text-white" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Coming Soon</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Question Paper Generator</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                This feature is under development. Soon you&apos;ll be able to auto-generate question papers from uploaded content and practice tests.
              </p>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-lg font-bold text-primary">📝</p>
                <p className="text-xs text-muted-foreground mt-1">Select Standard</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-lg font-bold text-primary">⚙️</p>
                <p className="text-xs text-muted-foreground mt-1">Configure Paper</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-lg font-bold text-primary">📄</p>
                <p className="text-xs text-muted-foreground mt-1">Download PDF</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
