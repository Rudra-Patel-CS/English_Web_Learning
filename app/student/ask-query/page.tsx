'use client'

import { useState, useEffect } from 'react'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Send, CheckCircle, Loader2, HelpCircle, Sparkles, ImageIcon, MessageSquare, Clock, User, X, ZoomIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Query } from '@/lib/types'

export default function AskQueryPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    student_name: user?.name || '',
    student_email: user?.email || '',
    subject: '',
    doubt: '',
    standard: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const [queries, setQueries] = useState<Query[]>([])
  const [loadingQueries, setLoadingQueries] = useState(false)
  const [activeTab, setActiveTab] = useState('ask')

  const fetchMyQueries = async () => {
    if (!user?.email) return
    setLoadingQueries(true)
    const { data } = await supabase.from('queries').select('*').eq('student_email', user.email).order('created_at', { ascending: false })
    if (data) setQueries(data as Query[])
    setLoadingQueries(false)
  }

  useEffect(() => {
    if (activeTab === 'my-queries') fetchMyQueries()
  }, [activeTab, user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.student_name || !form.student_email || !form.subject || !form.doubt) {
      setError('Please fill all required fields.')
      return
    }

    setIsSubmitting(true)
    setError('')

    let imageUrl = null
    if (imageFile) {
      const path = `student_queries/${Date.now()}_${imageFile.name}`
      const { error: uploadError } = await supabase.storage.from('query_images').upload(path, imageFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('query_images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      } else {
        console.error("Image upload error:", uploadError)
      }
    }

    const { error: insertError } = await supabase.from('queries').insert({
      student_name: form.student_name,
      student_email: form.student_email,
      student_id: user?.id || null,
      subject: form.subject,
      doubt: form.doubt,
      standard: form.standard || null,
      student_image_url: imageUrl,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    })

    setIsSubmitting(false)

    if (insertError) {
      setError('Failed to submit query. Please try again.')
      return
    }

    setIsSubmitted(true)
  }

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <StudentHeader title="Ask Queries" subtitle="Submit your doubts and get answers" />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
                <CheckCircle className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Query Submitted! 🎉</h3>
              <p className="text-muted-foreground mb-6">
                Your doubt has been sent to the teacher. You will receive an answer soon.
              </p>
              <div className="space-y-3">
                <Button onClick={() => { setActiveTab('my-queries'); setIsSubmitted(false) }} className="w-full" variant="outline">View My Queries</Button>
                <Button
                  onClick={() => {
                    setIsSubmitted(false)
                    setForm({ student_name: user?.name || '', student_email: user?.email || '', subject: '', doubt: '', standard: '' })
                    removeImage()
                  }}
                  className="w-full"
                >
                  Ask Another Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <StudentHeader title="Ask Queries" subtitle="Submit your doubts and get answers from teachers" />

      <div className="p-6 space-y-6">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 right-8 animate-float opacity-30 hidden md:block">
              <div className="threed-pencil" style={{ transform: 'rotate(-25deg) scale(0.5)' }} />
            </div>
          </div>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <HelpCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Have a Doubt?</h2>
              <p className="text-sm text-muted-foreground">Ask questions, attach photos, and get answers directly from teachers</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="ask"><Sparkles className="h-4 w-4 mr-2" /> Ask a Question</TabsTrigger>
            <TabsTrigger value="my-queries"><MessageSquare className="h-4 w-4 mr-2" /> My Queries</TabsTrigger>
          </TabsList>

          <TabsContent value="ask">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email ID *</Label>
                      <Input id="email" type="email" value={form.student_email} onChange={e => setForm({ ...form, student_email: e.target.value })} required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="standard">Standard</Label>
                      <Select value={form.standard} onValueChange={v => setForm({ ...form, standard: v })}>
                        <SelectTrigger><SelectValue placeholder="Select Standard" /></SelectTrigger>
                        <SelectContent>
                          {[6, 7, 8, 9, 10, 11, 12].map(s => <SelectItem key={s} value={s.toString()}>Standard {s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input value={today} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject / Topic *</Label>
                    <Input id="subject" placeholder="e.g., Grammar, Comprehension, Math Problem" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doubt">Your Doubt / Question *</Label>
                    <Textarea id="doubt" placeholder="Describe your doubt in detail..." rows={5} value={form.doubt} onChange={e => setForm({ ...form, doubt: e.target.value })} required />
                  </div>

                  <div className="space-y-2">
                    <Label>Attach a Photo (Optional)</Label>
                    {imagePreview ? (
                      <div className="relative w-full max-w-sm rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="w-full h-auto" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={removeImage}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-sm cursor-pointer" />
                        <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                      </div>
                    )}
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full py-6 text-base" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-5 w-5" /> Submit Query</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-queries">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                {loadingQueries ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : queries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>You haven't asked any questions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {queries.map(q => (
                      <div key={q.id} className="border rounded-xl overflow-hidden bg-background">
                        {/* Question Section */}
                        <div className="p-5 bg-muted/30">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{q.subject}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(q.created_at || '').toLocaleDateString()}</span>
                            </div>
                            <Badge variant={q.status === 'answered' ? 'default' : 'secondary'} className={q.status === 'answered' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}>
                              {q.status === 'answered' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                              {q.status === 'answered' ? 'Answered' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="font-medium text-foreground">{q.doubt}</p>
                          {q.student_image_url && (
                            <div className="mt-3 relative group cursor-pointer inline-block" onClick={() => setZoomedImage(q.student_image_url!)}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={q.student_image_url} alt="Attached by student" className="w-full h-auto max-h-48 object-contain bg-black/5 rounded-lg border hover:opacity-90 transition-opacity" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 rounded-lg transition-opacity"><ZoomIn className="text-white h-8 w-8 drop-shadow-md" /></div>
                            </div>
                          )}
                        </div>

                        {/* Answer Section */}
                        {q.status === 'answered' && q.answer && (
                          <div className="p-5 border-t bg-primary/5">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="space-y-3 flex-1">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-primary">Teacher Reply</p>
                                    {q.answered_at && <span className="text-xs text-muted-foreground">{new Date(q.answered_at).toLocaleDateString()}</span>}
                                  </div>
                                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{q.answer}</p>
                                </div>
                                {q.admin_image_url && (
                                  <div className="mt-2 relative group cursor-pointer inline-block" onClick={() => setZoomedImage(q.admin_image_url!)}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={q.admin_image_url} alt="Attached by teacher" className="w-full h-auto max-h-48 object-contain bg-white rounded-lg border shadow-sm hover:opacity-90 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 rounded-lg transition-opacity"><ZoomIn className="text-white h-8 w-8 drop-shadow-md" /></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
