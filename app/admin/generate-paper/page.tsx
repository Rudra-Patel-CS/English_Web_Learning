'use client'

import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, BookOpen, ArrowRight } from 'lucide-react'

export default function GeneratePaperPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen">
      <AdminHeader title="Generate Question Paper" subtitle="Manage questions and generate question papers" />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manage Questions Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer border-0 overflow-hidden group">
              <CardContent className="p-0">
                <div className="relative overflow-hidden h-48 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute top-4 right-8 animate-float">
                      <BookOpen className="h-24 w-24 text-blue-600" />
                    </div>
                  </div>
                  <div className="relative h-full flex flex-col justify-center p-6">
                    <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition">
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Manage Questions</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Add and organize questions by instruction type and standard
                    </p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      Add questions with answers
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      Organize by standard & instruction
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      Bulk upload from documents
                    </li>
                  </ul>
                  <Button
                    onClick={() => router.push('/admin/generate-paper/manage-questions')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Manage Questions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generate Paper Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden opacity-60">
              <CardContent className="p-0">
                <div className="relative overflow-hidden h-48 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute top-4 right-8 animate-float">
                      <ClipboardList className="h-24 w-24 text-purple-600" />
                    </div>
                  </div>
                  <div className="relative h-full flex flex-col justify-center p-6">
                    <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center mb-3 shadow-lg">
                      <ClipboardList className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Generate Paper</h3>
                    <p className="text-sm text-muted-foreground">
                      Create question papers from question bank (Coming soon)
                    </p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      Select questions by type
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      Configure paper settings
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      Download as PDF
                    </li>
                  </ul>
                  <Button disabled className="w-full bg-purple-600 hover:bg-purple-700">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
              <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
                <li>Start with <strong>Manage Questions</strong> to build your question bank</li>
                <li>Select a standard and instruction type</li>
                <li>Add questions with answers (or bulk upload from documents)</li>
                <li>Once your bank is ready, use <strong>Generate Paper</strong> to create papers</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

