'use client'

import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import { 
  BookOpen, 
  Video, 
  FileText, 
  PenTool, 
  Clock, 
  TrendingUp,
  PlayCircle,
  ChevronRight,
  Target,
  Award
} from 'lucide-react'

const recentMaterials = [
  { id: 1, title: 'Grammar: Active and Passive Voice', type: 'material', progress: 75 },
  { id: 2, title: 'Essay Writing Techniques', type: 'material', progress: 40 },
  { id: 3, title: 'Comprehension Practice - Lesson 5', type: 'reading', progress: 100 },
]

const recommendedVideos = [
  { id: 1, title: 'Tenses Made Easy - Part 1', duration: '15:30', thumbnail: 'grammar' },
  { id: 2, title: 'Article Writing Tips', duration: '12:45', thumbnail: 'writing' },
  { id: 3, title: 'Spoken English Basics', duration: '20:00', thumbnail: 'spoken' },
]

const quickStats = [
  { label: 'Materials Completed', value: 12, total: 25, icon: FileText, color: 'text-primary' },
  { label: 'Videos Watched', value: 8, total: 18, icon: Video, color: 'text-accent' },
  { label: 'Tests Taken', value: 5, total: 15, icon: PenTool, color: 'text-chart-4' },
  { label: 'Study Hours', value: 24, total: null, icon: Clock, color: 'text-chart-3' },
]

export default function StudentDashboard() {
  const { user } = useAuth()

  return (
    <div>
      <StudentHeader 
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Student'}!`}
        subtitle={`Standard ${user?.standard || '10'} - Keep up the great work`}
      />
      
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                      {stat.total && <span className="text-sm font-normal text-muted-foreground">/{stat.total}</span>}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                {stat.total && (
                  <Progress value={(stat.value / stat.total) * 100} className="mt-3 h-1.5" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Continue Learning</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/materials">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMaterials.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {item.type === 'material' ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={item.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground">{item.progress}%</span>
                        </div>
                      </div>
                      {item.progress === 100 ? (
                        <Award className="h-5 w-5 text-accent" />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Goals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Weekly Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Complete 5 lessons</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">3 of 5 completed</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <span className="font-medium text-foreground">Practice for 2 hours</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">1.5 of 2 hours</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3 mb-2">
                    <PenTool className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Take 2 practice tests</span>
                  </div>
                  <Progress value={50} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">1 of 2 completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Videos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recommended Videos</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/videos">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedVideos.map((video) => (
                <div key={video.id} className="group rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/standard">
            <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">My Standard</p>
                  <p className="text-sm text-muted-foreground">View all resources</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/practice">
            <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <PenTool className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Practice Tests</p>
                  <p className="text-sm text-muted-foreground">Test your knowledge</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/videos">
            <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-chart-3/10">
                  <Video className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Video Tutorials</p>
                  <p className="text-sm text-muted-foreground">Watch and learn</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/ask-query">
            <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-chart-4/10">
                  <FileText className="h-6 w-6 text-chart-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ask Query</p>
                  <p className="text-sm text-muted-foreground">Get your doubts solved</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
