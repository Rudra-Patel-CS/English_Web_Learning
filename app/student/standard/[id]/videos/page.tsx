'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Video, ExternalLink, Play, Clock, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { VideoLink } from '@/lib/types'

export default function StudentVideosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [videos, setVideos] = useState<VideoLink[]>([])
  const [standardName, setStandardName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: stdData } = await supabase.from('standards').select('name').eq('id', id).single()
      if (stdData) setStandardName(stdData.name)

      const { data } = await supabase
        .from('video_links')
        .select('*')
        .eq('standard_id', id)
        .order('created_at', { ascending: false })

      if (data) setVideos(data)
      setLoading(false)
    }
    fetchData()
  }, [id])

  // Extract YouTube thumbnail from URL
  const getYoutubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
    return null
  }

  return (
    <div className="min-h-screen">
      <StudentHeader title="Video Links" subtitle={`${standardName} — Video tutorials and lecture recordings`} />

      <div className="p-6 space-y-6">
        <Link href={`/student/standard/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to {standardName}
        </Link>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Videos Yet</h3>
            <p className="text-muted-foreground">Video links for this standard will appear here once added.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const thumbnail = video.thumbnail_url || getYoutubeThumbnail(video.video_url)
              return (
                <Card key={video.id} className="overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {thumbnail ? (
                      <img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                    )}
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-purple-600 ml-1" />
                      </div>
                    </a>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{video.title}</h3>
                    {video.chapter && <p className="text-xs text-muted-foreground mb-2">Chapter: {video.chapter}</p>}
                    {video.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>}
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Watch Video
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
