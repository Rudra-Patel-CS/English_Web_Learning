'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Play,
  Search,
  Video,
} from 'lucide-react'

const subjectData: Record<string, {
  name: string
  chapters: Array<{
    id: string
    name: string
    materials: number
    videos: number
    completed: boolean
  }>
}> = {
  'english': {
    name: 'English',
    chapters: [
      { id: 'c1', name: 'Chapter 1 - Introduction to Grammar', materials: 5, videos: 2, completed: true },
      { id: 'c2', name: 'Chapter 2 - Tenses', materials: 8, videos: 3, completed: true },
      { id: 'c3', name: 'Chapter 3 - Direct & Indirect Speech', materials: 6, videos: 2, completed: false },
      { id: 'c4', name: 'Chapter 4 - Active & Passive Voice', materials: 7, videos: 2, completed: false },
      { id: 'c5', name: 'Chapter 5 - Comprehension', materials: 4, videos: 1, completed: false },
      { id: 'c6', name: 'Chapter 6 - Writing Skills', materials: 6, videos: 2, completed: false },
    ],
  },
  'mathematics': {
    name: 'Mathematics',
    chapters: [
      { id: 'c1', name: 'Chapter 1 - Numbers', materials: 6, videos: 3, completed: true },
      { id: 'c2', name: 'Chapter 2 - Algebra', materials: 8, videos: 4, completed: false },
      { id: 'c3', name: 'Chapter 3 - Geometry', materials: 7, videos: 3, completed: false },
    ],
  },
}

const materials = [
  { id: 'm1', title: 'Grammar Rules PDF', type: 'pdf', size: '2.5 MB' },
  { id: 'm2', title: 'Practice Worksheet', type: 'pdf', size: '1.2 MB' },
  { id: 'm3', title: 'Notes - Summary', type: 'doc', size: '850 KB' },
]

const videos = [
  { id: 'v1', title: 'Introduction to Topic', duration: '15:30', thumbnail: '' },
  { id: 'v2', title: 'Examples & Practice', duration: '22:45', thumbnail: '' },
]

export default function SubjectPage() {
  const params = useParams()
  const classId = params.id as string
  const subjectSlug = params.subject as string
  
  const subject = subjectData[subjectSlug] || { name: 'Subject', chapters: [] }
  const completedChapters = subject.chapters.filter(c => c.completed).length
  const progress = Math.round((completedChapters / subject.chapters.length) * 100)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)

  const filteredChapters = subject.chapters.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      <StudentHeader 
        title={subject.name} 
        subtitle={`STD ${classId} - ${subject.chapters.length} chapters`} 
      />

      <div className="p-6 space-y-6">
        {/* Back & Progress */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <Link href="/student/classes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Classes
            </Button>
          </Link>
          
          <Card className="w-full sm:w-auto">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{completedChapters}/{subject.chapters.length} chapters</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <Badge variant="secondary">{progress}%</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Chapters List */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chapters */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-foreground mb-2">Chapters</h3>
            {filteredChapters.map((chapter) => (
              <div
                key={chapter.id}
                onClick={() => setSelectedChapter(chapter.id)}
                className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                  selectedChapter === chapter.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  chapter.completed 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-muted'
                }`}>
                  {chapter.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{chapter.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {chapter.materials} materials, {chapter.videos} videos
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Chapter Content */}
          <Card className="lg:col-span-2">
            {selectedChapter ? (
              <>
                <CardHeader>
                  <CardTitle>
                    {subject.chapters.find(c => c.id === selectedChapter)?.name}
                  </CardTitle>
                  <CardDescription>Study materials and videos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="materials">
                    <TabsList className="mb-4">
                      <TabsTrigger value="materials">
                        <FileText className="mr-2 h-4 w-4" />
                        Materials
                      </TabsTrigger>
                      <TabsTrigger value="videos">
                        <Video className="mr-2 h-4 w-4" />
                        Videos
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="materials" className="space-y-3">
                      {materials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{material.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {material.type.toUpperCase()} - {material.size}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="videos" className="space-y-3">
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                              <Play className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{video.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {video.duration}
                              </p>
                            </div>
                          </div>
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Watch
                          </Button>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">Select a Chapter</h3>
                <p className="text-muted-foreground text-center">
                  Choose a chapter from the list to view materials and videos
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
