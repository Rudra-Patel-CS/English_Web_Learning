'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2, AlertTriangle, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { PracticeTest, McqQuestion } from '@/lib/types'

type TestState = 'loading' | 'ready' | 'active' | 'submitted'

export default function TakeTestPage({ params }: { params: Promise<{ id: string; testId: string }> }) {
  const { id, testId } = use(params)
  const [test, setTest] = useState<PracticeTest | null>(null)
  const [questions, setQuestions] = useState<McqQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [state, setState] = useState<TestState>('loading')
  const [score, setScore] = useState(0)

  useEffect(() => {
    const load = async () => {
      const [
        { data: t },
        { data: q }
      ] = await Promise.all([
        supabase.from('practice_tests').select('*').eq('id', testId).single(),
        supabase.from('mcq_questions').select('*').eq('test_id', testId).order('question_number')
      ])
      
      if (t) { setTest(t); setTimeLeft((t.duration_minutes || 30) * 60) }
      if (q) setQuestions(q)
      setState('ready')
    }
    load()
  }, [testId])

  const submitTest = useCallback(() => {
    let correct = 0
    questions.forEach(q => { if (answers[q.id] === q.correct_option) correct++ })
    setScore(correct)
    setState('submitted')
  }, [questions, answers])

  useEffect(() => {
    if (state !== 'active') return
    if (timeLeft <= 0) { submitTest(); return }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [state, timeLeft, submitTest])

  const startTest = () => { setState('active') }
  const selectAnswer = (qId: string, opt: string) => { setAnswers(p => ({ ...p, [qId]: opt })) }
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const answered = Object.keys(answers).length
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0

  if (state === 'loading') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  if (state === 'ready') return (
    <div className="min-h-screen">
      <StudentHeader title={test?.title || 'Practice Test'} subtitle="Get ready to start" />
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg w-full border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow">
              <Clock className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{test?.title}</h2>
            {test?.description && <p className="text-muted-foreground mb-4">{test.description}</p>}
            <div className="flex justify-center gap-3 mb-6">
              <Badge variant="secondary" className="text-sm py-1 px-3"><Clock className="mr-1 h-4 w-4" />{test?.duration_minutes} minutes</Badge>
              {test?.total_marks && <Badge variant="secondary" className="text-sm py-1 px-3">{test.total_marks} marks</Badge>}
              <Badge variant="outline" className="text-sm py-1 px-3">{questions.length} questions</Badge>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-2"><AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Instructions:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>Test will auto-submit when time runs out</li>
                    <li>You can navigate between questions</li>
                    <li>Select one option per question</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button className="w-full py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" onClick={startTest}>
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (state === 'submitted') return (
    <div className="min-h-screen">
      <StudentHeader title="Test Results" subtitle={test?.title || ''} />
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className={`p-8 text-center ${pct >= 70 ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10' : pct >= 40 ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10' : 'bg-gradient-to-br from-red-500/10 to-pink-500/10'}`}>
            <Trophy className={`h-16 w-16 mx-auto mb-4 ${pct >= 70 ? 'text-emerald-500' : pct >= 40 ? 'text-amber-500' : 'text-red-500'}`} />
            <h2 className="text-3xl font-black mb-1">{score} / {questions.length}</h2>
            <p className="text-lg text-muted-foreground">{pct}% Score</p>
            <p className="text-sm font-medium mt-2">{pct >= 70 ? 'Excellent! 🎉' : pct >= 40 ? 'Good effort! Keep practicing.' : 'Needs improvement. Review and try again.'}</p>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-emerald-50 rounded-xl p-3"><p className="text-2xl font-bold text-emerald-600">{score}</p><p className="text-xs text-muted-foreground">Correct</p></div>
              <div className="bg-red-50 rounded-xl p-3"><p className="text-2xl font-bold text-red-600">{questions.length - score}</p><p className="text-xs text-muted-foreground">Wrong</p></div>
              <div className="bg-blue-50 rounded-xl p-3"><p className="text-2xl font-bold text-blue-600">{questions.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
            </div>
            <Button asChild className="w-full"><Link href={`/student/standard/${id}/tests`}>Back to Tests</Link></Button>
          </CardContent>
        </Card>

        {/* Answer Review */}
        <h3 className="text-lg font-bold">Answer Review</h3>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const userAns = answers[q.id]; const isCorrect = userAns === q.correct_option
            return (
              <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                    <p className="font-medium text-sm"><span className="text-muted-foreground mr-1">Q{i + 1}.</span>{q.question_text}</p>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2 ml-7">
                    {(['A', 'B', 'C', 'D'] as const).map(o => {
                      const v = q[`option_${o.toLowerCase()}` as keyof McqQuestion] as string
                      const isCor = q.correct_option === o; const isUser = userAns === o
                      return <div key={o} className={`text-xs px-2.5 py-1.5 rounded ${isCor ? 'bg-emerald-100 text-emerald-800 font-medium' : isUser && !isCor ? 'bg-red-100 text-red-800' : 'bg-muted/50'}`}>
                        <span className="font-semibold mr-1">{o}.</span>{v}{isCor && ' ✓'}{isUser && !isCor && ' ✗'}
                      </div>
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ACTIVE TEST
  const q = questions[currentQ]
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Timer Bar */}
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate mr-4">{test?.title}</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{answered}/{questions.length} answered</span>
            <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'} className="text-sm py-1 px-3 font-mono">
              <Clock className="mr-1 h-4 w-4" />{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </Badge>
          </div>
        </div>
        <div className="h-1 bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${((test?.duration_minutes || 30) * 60 - timeLeft) / ((test?.duration_minutes || 30) * 60) * 100}%` }} /></div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex gap-6">
          {/* Question Panel */}
          <div className="flex-1 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{currentQ + 1}</span>
                  <span className="text-sm text-muted-foreground">of {questions.length}</span>
                </div>
                <p className="text-lg font-medium mb-6">{q.question_text}</p>
                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map(o => {
                    const v = q[`option_${o.toLowerCase()}` as keyof McqQuestion] as string
                    const selected = answers[q.id] === o
                    return (
                      <button key={o} onClick={() => selectAnswer(q.id, o)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${selected ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40 hover:bg-muted/50'}`}>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0 ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{o}</span>
                        <span className="text-sm">{v}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}>
                <ChevronLeft className="mr-1 h-4 w-4" />Previous
              </Button>
              {currentQ < questions.length - 1 ? (
                <Button onClick={() => setCurrentQ(p => p + 1)}>Next<ChevronRight className="ml-1 h-4 w-4" /></Button>
              ) : (
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" onClick={submitTest}>Submit Test</Button>
              )}
            </div>
          </div>

          {/* Question Palette - Desktop */}
          <div className="hidden lg:block w-48 shrink-0">
            <Card className="border-0 shadow-md sticky top-20">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">QUESTIONS</p>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((qq, i) => (
                    <button key={qq.id} onClick={() => setCurrentQ(i)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${i === currentQ ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : answers[qq.id] ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-accent" /><span>Answered ({answered})</span></div>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-muted" /><span>Not answered ({questions.length - answered})</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
