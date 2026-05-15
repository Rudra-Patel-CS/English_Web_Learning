'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ChevronRight, FolderOpen, Search, Video } from 'lucide-react'

const mockClasses = [
  { 
    id: '1', 
    name: 'STD 6', 
    subjects: [
      { name: 'English', chapters: 12, progress: 67 },
      { name: 'Mathematics', chapters: 10, progress: 45 },
      { name: 'Science', chapters: 8, progress: 80 },
      { name: 'Hindi', chapters: 10, progress: 30 },
      { name: 'Social Studies', chapters: 9, progress: 55 },
    ],
    totalProgress: 55
  },
  { 
    id: '2', 
    name: 'STD 7', 
    subjects: [
      { name: 'English', chapters: 14, progress: 40 },
      { name: 'Mathematics', chapters: 12, progress: 25 },
      { name: 'Science', chapters: 10, progress: 60 },
    ],
    totalProgress: 42
  },
  { 
    id: '3', 
    name: 'STD 8', 
    subjects: [
      { name: 'English', chapters: 15, progress: 20 },
      { name: 'Mathematics', chapters: 14, progress: 15 },
    ],
    totalProgress: 18
  },
]

export default function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClasses = mockClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.subjects.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen">
      <StudentHeader title="My Classes" subtitle="Browse available study materials" />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search classes or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Classes Grid */}
        <div className="space-y-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <FolderOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>{cls.subjects.length} subjects available</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {cls.totalProgress}% completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cls.subjects.map((subject, index) => (
                    <Link key={index} href={`/student/classes/${cls.id}/${subject.name.toLowerCase().replace(' ', '-')}`}>
                      <div className="flex items-center justify-between rounded-lg border border-border p-4 hover:border-primary/50 hover:bg-accent transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{subject.name}</p>
                            <p className="text-xs text-muted-foreground">{subject.chapters} chapters</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary">{subject.progress}%</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No classes found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  )
}
