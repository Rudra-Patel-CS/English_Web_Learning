'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ArrowLeft, BookOpen, ChevronRight, FileQuestion, FileText, Plus, Search, Video } from 'lucide-react'

const standardsData: Record<string, { name: string; subjects: Subject[] }> = {
  '1': {
    name: 'STD 6',
    subjects: [
      {
        id: 's1',
        name: 'English',
        chapters: [
          { id: 'c1', name: 'Chapter 1 - Introduction to Grammar', questions: 45 },
          { id: 'c2', name: 'Chapter 2 - Tenses', questions: 52 },
          { id: 'c3', name: 'Chapter 3 - Direct & Indirect Speech', questions: 38 },
          { id: 'c4', name: 'Chapter 4 - Active & Passive Voice', questions: 41 },
        ],
      },
      {
        id: 's2',
        name: 'Mathematics',
        chapters: [
          { id: 'c5', name: 'Chapter 1 - Numbers', questions: 60 },
          { id: 'c6', name: 'Chapter 2 - Algebra Basics', questions: 48 },
          { id: 'c7', name: 'Chapter 3 - Geometry', questions: 55 },
        ],
      },
      {
        id: 's3',
        name: 'Science',
        chapters: [
          { id: 'c8', name: 'Chapter 1 - Living Things', questions: 42 },
          { id: 'c9', name: 'Chapter 2 - Matter & Energy', questions: 50 },
        ],
      },
    ],
  },
  '2': { name: 'STD 7', subjects: [] },
  '3': { name: 'STD 8', subjects: [] },
  '4': { name: 'STD 9', subjects: [] },
  '5': { name: 'STD 10', subjects: [] },
  '6': { name: 'STD 12', subjects: [] },
}

interface Chapter {
  id: string
  name: string
  questions: number
}

interface Subject {
  id: string
  name: string
  chapters: Chapter[]
}

export default function StandardDetailPage() {
  const params = useParams()
  const standardId = params.id as string
  const standardData = standardsData[standardId] || { name: 'Unknown', subjects: [] }
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newChapter, setNewChapter] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title={standardData.name} 
        subtitle="Manage subjects and chapters" 
      />

      <div className="p-6 space-y-6">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/standards">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subjects or chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Create a new subject for {standardData.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    placeholder="e.g., Hindi"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddSubjectOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    setNewSubject('')
                    setIsAddSubjectOpen(false)
                  }}>
                    Add Subject
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="subjects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subjects">Subjects & Chapters</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-4">
            {standardData.subjects.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-3">
                {standardData.subjects.map((subject) => (
                  <AccordionItem
                    key={subject.id}
                    value={subject.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{subject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subject.chapters.length} chapters
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="space-y-2 ml-13">
                        {subject.chapters.map((chapter) => (
                          <div
                            key={chapter.id}
                            className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{chapter.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center text-xs text-muted-foreground">
                                <FileQuestion className="mr-1 h-3 w-3" />
                                {chapter.questions} questions
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSelectedSubject(subject.id)
                            setIsAddChapterOpen(true)
                          }}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Add Chapter
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground">No subjects yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add subjects to organize your study materials.
                  </p>
                  <Button onClick={() => setIsAddSubjectOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Subject
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Study Materials</CardTitle>
                <CardDescription>PDFs, documents, and notes for this standard</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No materials uploaded yet</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Material
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reference Videos</CardTitle>
                <CardDescription>Video lectures and tutorials</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No videos added yet</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Video
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Chapter Dialog */}
      <Dialog open={isAddChapterOpen} onOpenChange={setIsAddChapterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Chapter</DialogTitle>
            <DialogDescription>
              Create a new chapter for this subject.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-name">Chapter Name</Label>
              <Input
                id="chapter-name"
                placeholder="e.g., Chapter 5 - Comprehension"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddChapterOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setNewChapter('')
                setIsAddChapterOpen(false)
              }}>
                Add Chapter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
