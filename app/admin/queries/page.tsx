'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { HelpCircle, Clock, CheckCircle, Send, User, MessageSquare, Loader2, Mail, ImageIcon, X, ZoomIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Query } from '@/lib/types'

export default function ManageQueriesPage() {
  const { user } = useAuth()
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyImage, setReplyImage] = useState<File | null>(null)
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  const fetchQueries = async () => {
    setLoading(true)
    const { data } = await supabase.from('queries').select('*').order('created_at', { ascending: false })
    if (data) setQueries(data as Query[])
    setLoading(false)
  }

  useEffect(() => { fetchQueries() }, [])

  const pending = queries.filter(q => q.status === 'pending')
  const answered = queries.filter(q => q.status === 'answered')
  const display = activeTab === 'pending' ? pending : answered

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReplyImage(file)
      setReplyImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setReplyImage(null)
    setReplyImagePreview(null)
  }

  const handleSendReply = async () => {
    if (!selectedQuery || (!replyText.trim() && !replyImage)) return
    setSending(true)

    let imageUrl = null
    if (replyImage) {
      const path = `admin_replies/${Date.now()}_${replyImage.name}`
      const { error: uploadError } = await supabase.storage.from('query_images').upload(path, replyImage)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('query_images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }
    }

    await supabase.from('queries').update({
      answer: replyText,
      status: 'answered',
      answered_by: user?.id,
      answered_at: new Date().toISOString(),
      admin_image_url: imageUrl,
    }).eq('id', selectedQuery.id)

    setSending(false)
    setSelectedQuery(null)
    setReplyText('')
    removeImage()
    fetchQueries()
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Student Queries" subtitle="Respond to student questions and doubts" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="stat-card-3d border-0 shadow-md bg-blue-50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow"><HelpCircle className="h-5 w-5 text-white" /></div>
              <div><p className="text-2xl font-bold">{queries.length}</p><p className="text-sm text-muted-foreground">Total</p></div>
            </CardContent>
          </Card>
          <Card className="stat-card-3d border-0 shadow-md bg-amber-50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow"><Clock className="h-5 w-5 text-white" /></div>
              <div><p className="text-2xl font-bold">{pending.length}</p><p className="text-sm text-muted-foreground">Pending</p></div>
            </CardContent>
          </Card>
          <Card className="stat-card-3d border-0 shadow-md bg-emerald-50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow"><CheckCircle className="h-5 w-5 text-white" /></div>
              <div><p className="text-2xl font-bold">{answered.length}</p><p className="text-sm text-muted-foreground">Answered</p></div>
            </CardContent>
          </Card>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* List */}
            <Card className="border-0 shadow-md">
              <div className="p-4 border-b">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="pending">Pending <Badge variant="secondary" className="ml-1">{pending.length}</Badge></TabsTrigger>
                    <TabsTrigger value="answered">Answered <Badge variant="secondary" className="ml-1">{answered.length}</Badge></TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardContent className="p-4">
                {display.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground"><MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No {activeTab} queries</p></div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {display.map((q) => (
                      <div key={q.id} onClick={() => { setSelectedQuery(q); setReplyText(''); removeImage() }}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedQuery?.id === q.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                            <div>
                              <p className="font-medium">{q.student_name}</p>
                              <p className="text-xs text-muted-foreground">{q.standard ? `Std ${q.standard}` : ''} • {q.subject}</p>
                            </div>
                          </div>
                          <Badge variant={q.status === 'pending' ? 'outline' : 'default'} className={q.status === 'answered' ? 'bg-accent text-accent-foreground' : ''}>
                            {q.status === 'pending' ? <><Clock className="h-3 w-3 mr-1" />Pending</> : <><CheckCircle className="h-3 w-3 mr-1" />Answered</>}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm line-clamp-2">{q.doubt}</p>
                        {q.student_image_url && <Badge variant="outline" className="mt-2"><ImageIcon className="h-3 w-3 mr-1" /> Image Attached</Badge>}
                        <p className="text-xs text-muted-foreground mt-1">{q.date || new Date(q.created_at!).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reply Panel */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                {selectedQuery ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                        <div>
                          <p className="font-medium">{selectedQuery.student_name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{selectedQuery.student_email}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mb-2">{selectedQuery.subject}</Badge>
                      {selectedQuery.standard && <Badge variant="outline" className="ml-2 mb-2">Std {selectedQuery.standard}</Badge>}
                      <p className="text-foreground mt-2">{selectedQuery.doubt}</p>
                      {selectedQuery.student_image_url && (
                        <div className="mt-3 relative group cursor-pointer" onClick={() => setZoomedImage(selectedQuery.student_image_url!)}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={selectedQuery.student_image_url} alt="Student attachment" className="rounded-lg max-h-64 object-contain border hover:opacity-90 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 rounded-lg transition-opacity"><ZoomIn className="text-white h-8 w-8 drop-shadow-md" /></div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">{selectedQuery.date}</p>
                    </div>
                    {selectedQuery.status === 'answered' ? (
                      <div className="p-4 rounded-lg bg-accent/5 border-l-2 border-accent">
                        <p className="text-xs font-medium text-accent mb-2">Your Answer:</p>
                        <p className="whitespace-pre-wrap">{selectedQuery.answer}</p>
                        {selectedQuery.admin_image_url && (
                          <div className="mt-3 relative group cursor-pointer" onClick={() => setZoomedImage(selectedQuery.admin_image_url!)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={selectedQuery.admin_image_url} alt="Admin attachment" className="rounded-lg max-h-64 object-contain border bg-white hover:opacity-90 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 rounded-lg transition-opacity"><ZoomIn className="text-white h-8 w-8 drop-shadow-md" /></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Textarea placeholder="Type your answer..." rows={6} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                        
                        <div className="flex items-center gap-2">
                          {replyImagePreview ? (
                            <div className="relative inline-block">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={replyImagePreview} alt="Reply preview" className="h-16 rounded border" />
                              <button onClick={removeImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="h-3 w-3" /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-[250px] text-sm" />
                              <span className="text-xs text-muted-foreground">Attach Image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button className="flex-1" onClick={handleSendReply} disabled={(!replyText.trim() && !replyImage) || sending}>
                            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send Reply
                          </Button>
                          <Button variant="outline" onClick={() => { setSelectedQuery(null); setReplyText(''); removeImage() }}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground"><MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" /><p>Select a query to view details</p></div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent 
          className="border-none shadow-none rounded-none sm:rounded-none flex items-center justify-center overflow-hidden"
          style={{ maxWidth: '100vw', width: '100vw', height: '100vh', padding: 0, margin: 0, backgroundColor: 'rgba(0,0,0,0.95)' }}
        >
          <DialogTitle className="sr-only">Zoomed Image View</DialogTitle>
          <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 z-[60] bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
          {zoomedImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={zoomedImage} 
              alt="Zoomed view" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2rem' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
