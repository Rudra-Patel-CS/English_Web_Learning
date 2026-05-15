'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { 
  BookOpen, 
  Video, 
  FileText, 
  BookMarked,
  PenTool,
  Download,
  ExternalLink,
  PlayCircle,
  ChevronRight
} from 'lucide-react'

// Mock data for Standard 10
const standardData = {
  materials: [
    { id: 1, title: 'Grammar: Tenses Complete Guide', type: 'PDF', size: '2.4 MB', chapter: 'Grammar Basics' },
    { id: 2, title: 'Active and Passive Voice Notes', type: 'PDF', size: '1.8 MB', chapter: 'Grammar Basics' },
    { id: 3, title: 'Direct and Indirect Speech', type: 'PDF', size: '2.1 MB', chapter: 'Speech' },
    { id: 4, title: 'Essay Writing Techniques', type: 'PDF', size: '1.5 MB', chapter: 'Writing Skills' },
    { id: 5, title: 'Letter Writing Format', type: 'PDF', size: '1.2 MB', chapter: 'Writing Skills' },
    { id: 6, title: 'Comprehension Strategies', type: 'PDF', size: '1.9 MB', chapter: 'Reading' },
  ],
  videos: [
    { id: 1, title: 'Tenses Made Easy - Complete Series', duration: '45:00', chapter: 'Grammar Basics', views: 1250 },
    { id: 2, title: 'Voice Change Explained', duration: '28:30', chapter: 'Grammar Basics', views: 890 },
    { id: 3, title: 'Essay Writing Masterclass', duration: '35:00', chapter: 'Writing Skills', views: 756 },
    { id: 4, title: 'Comprehension Tips and Tricks', duration: '22:15', chapter: 'Reading', views: 1102 },
    { id: 5, title: 'Spoken English for Beginners', duration: '40:00', chapter: 'Speaking', views: 2340 },
  ],
  textbooks: [
    { id: 1, title: 'English Textbook - Standard 10', type: 'Full Book', pages: 256 },
    { id: 2, title: 'Grammar Workbook', type: 'Workbook', pages: 128 },
    { id: 3, title: 'Supplementary Reader', type: 'Reader', pages: 98 },
  ],
  reading: [
    { id: 1, title: 'The Last Leaf - O. Henry', type: 'Story', difficulty: 'Medium' },
    { id: 2, title: 'My Financial Career - Stephen Leacock', type: 'Story', difficulty: 'Easy' },
    { id: 3, title: 'Comprehension Passage Set 1', type: 'Passage', difficulty: 'Medium' },
    { id: 4, title: 'Comprehension Passage Set 2', type: 'Passage', difficulty: 'Hard' },
    { id: 5, title: 'Poetry Analysis Practice', type: 'Poetry', difficulty: 'Medium' },
  ],
  tests: [
    { id: 1, title: 'Grammar Test - Tenses', questions: 25, duration: '30 min', difficulty: 'Medium' },
    { id: 2, title: 'Grammar Test - Voice', questions: 20, duration: '25 min', difficulty: 'Medium' },
    { id: 3, title: 'Comprehension Test', questions: 15, duration: '20 min', difficulty: 'Easy' },
    { id: 4, title: 'Vocabulary Test', questions: 30, duration: '20 min', difficulty: 'Easy' },
    { id: 5, title: 'Mock Test - Full Syllabus', questions: 50, duration: '60 min', difficulty: 'Hard' },
  ],
}

export default function MyStandardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('materials')

  return (
    <div>
      <StudentHeader 
        title={`Standard ${user?.standard || '10'} Resources`}
        subtitle="Access all learning materials for your standard"
      />
      
      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{standardData.materials.length}</p>
              <p className="text-xs text-muted-foreground">Materials</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 text-center">
              <Video className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-foreground">{standardData.videos.length}</p>
              <p className="text-xs text-muted-foreground">Videos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookMarked className="h-6 w-6 mx-auto mb-2 text-chart-3" />
              <p className="text-2xl font-bold text-foreground">{standardData.textbooks.length}</p>
              <p className="text-xs text-muted-foreground">Textbooks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-chart-4" />
              <p className="text-2xl font-bold text-foreground">{standardData.reading.length}</p>
              <p className="text-xs text-muted-foreground">Reading</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <PenTool className="h-6 w-6 mx-auto mb-2 text-chart-5" />
              <p className="text-2xl font-bold text-foreground">{standardData.tests.length}</p>
              <p className="text-xs text-muted-foreground">Tests</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="textbooks">Textbooks</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {standardData.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{material.title}</p>
                          <p className="text-sm text-muted-foreground">{material.chapter} • {material.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{material.type}</Badge>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {standardData.videos.map((video) => (
                    <div key={video.id} className="group rounded-lg border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative">
                        <Video className="h-10 w-10 text-primary/50" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                          <PlayCircle className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                          {video.duration}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-foreground text-sm line-clamp-2">{video.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{video.chapter} • {video.views.toLocaleString()} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Textbooks Tab */}
          <TabsContent value="textbooks">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Textbooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {standardData.textbooks.map((book) => (
                    <div key={book.id} className="p-4 rounded-lg border border-border hover:shadow-md transition-all">
                      <div className="w-full aspect-[3/4] bg-gradient-to-b from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-4">
                        <BookMarked className="h-16 w-16 text-primary/30" />
                      </div>
                      <h3 className="font-medium text-foreground">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.type} • {book.pages} pages</p>
                      <Button className="w-full mt-3" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Book
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading Tab */}
          <TabsContent value="reading">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reading Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {standardData.reading.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.difficulty === 'Easy' ? 'secondary' : item.difficulty === 'Medium' ? 'outline' : 'destructive'}>
                          {item.difficulty}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Practice Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {standardData.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                          <PenTool className="h-5 w-5 text-chart-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{test.title}</p>
                          <p className="text-sm text-muted-foreground">{test.questions} questions • {test.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={test.difficulty === 'Easy' ? 'secondary' : test.difficulty === 'Medium' ? 'outline' : 'destructive'}>
                          {test.difficulty}
                        </Badge>
                        <Button size="sm">Start Test</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
