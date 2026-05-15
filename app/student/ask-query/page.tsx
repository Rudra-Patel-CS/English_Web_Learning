'use client'

import { useState } from 'react'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, CheckCircle, Loader2, HelpCircle, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function AskQueryPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    student_name: user?.name || '',
    student_email: user?.email || '',
    subject: '',
    doubt: '',
    standard: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.student_name || !form.student_email || !form.subject || !form.doubt) {
      setError('Please fill all required fields.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const { error: insertError } = await supabase.from('queries').insert({
      student_name: form.student_name,
      student_email: form.student_email,
      student_id: user?.id || null,
      subject: form.subject,
      doubt: form.doubt,
      standard: form.standard || null,
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

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

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
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setForm({
                    student_name: user?.name || '',
                    student_email: user?.email || '',
                    subject: '',
                    doubt: '',
                    standard: '',
                  })
                }}
                className="w-full"
              >
                Ask Another Question
              </Button>
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
        {/* Header Banner */}
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
              <p className="text-sm text-muted-foreground">Fill out the form below and our teachers will respond to your query</p>
            </div>
          </div>
        </div>

        {/* Query Form */}
        <Card className="border-0 shadow-lg max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Submit Your Query</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={form.student_name}
                    onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email ID *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.student_email}
                    onChange={(e) => setForm({ ...form, student_email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="standard">Standard</Label>
                  <Select value={form.standard} onValueChange={(v) => setForm({ ...form, standard: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Standard" />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10, 11, 12].map((s) => (
                        <SelectItem key={s} value={s.toString()}>Standard {s}</SelectItem>
                      ))}
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
                <Input
                  id="subject"
                  placeholder="e.g., Grammar, Comprehension, Essay Writing"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doubt">Your Doubt / Question *</Label>
                <Textarea
                  id="doubt"
                  placeholder="Describe your doubt in detail..."
                  rows={5}
                  value={form.doubt}
                  onChange={(e) => setForm({ ...form, doubt: e.target.value })}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full py-6 text-base" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Query
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
