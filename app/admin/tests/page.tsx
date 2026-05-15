'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, PenTool, FolderOpen, GraduationCap, Loader2, Plus, Trash2, Edit, Clock, CheckCircle, Save, FileUp, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Standard, Unit, PracticeTest, McqQuestion } from '@/lib/types'

type ViewLevel = 'standards' | 'units' | 'tests' | 'builder'

export default function AdminTestsPage() {
  const { user } = useAuth()
  const [level, setLevel] = useState<ViewLevel>('standards')
  const [standards, setStandards] = useState<Standard[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [tests, setTests] = useState<PracticeTest[]>([])
  const [questions, setQuestions] = useState<McqQuestion[]>([])
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedTest, setSelectedTest] = useState<PracticeTest | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialogs
  const [unitDialogOpen, setUnitDialogOpen] = useState(false)
  const [unitForm, setUnitForm] = useState({ name: '', unit_number: '' })
  const [unitSaving, setUnitSaving] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testForm, setTestForm] = useState({ title: '', duration_minutes: '', total_marks: '', description: '' })
  const [testSaving, setTestSaving] = useState(false)
  const [qDialogOpen, setQDialogOpen] = useState(false)
  const [editingQId, setEditingQId] = useState<string | null>(null)
  const [qForm, setQForm] = useState({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' })
  const [qSaving, setQSaving] = useState(false)
  const [docDialogOpen, setDocDialogOpen] = useState(false)
  const [docUploading, setDocUploading] = useState(false)

  useEffect(() => { fetchStandards() }, [])

  const fetchStandards = async () => { setLoading(true); const { data } = await supabase.from('standards').select('*').order('grade_number'); if (data) setStandards(data); setLoading(false) }
  const fetchUnits = async (sid: string) => { setLoading(true); const { data } = await supabase.from('units').select('*').eq('standard_id', sid).order('unit_number'); if (data) setUnits(data); setLoading(false) }
  const fetchTests = async (uid: string) => { setLoading(true); const { data } = await supabase.from('practice_tests').select('*').eq('unit_id', uid).order('created_at', { ascending: false }); if (data) setTests(data); setLoading(false) }
  const fetchQuestions = async (tid: string) => { setLoading(true); const { data } = await supabase.from('mcq_questions').select('*').eq('test_id', tid).order('question_number'); if (data) setQuestions(data); setLoading(false) }

  const goStandards = () => { setLevel('standards'); setSelectedStandard(null); setSelectedUnit(null); setSelectedTest(null) }
  const goUnits = (s: Standard) => { setSelectedStandard(s); setLevel('units'); fetchUnits(s.id) }
  const goTests = (u: Unit) => { setSelectedUnit(u); setLevel('tests'); fetchTests(u.id) }
  const goBuilder = (t: PracticeTest) => { setSelectedTest(t); setLevel('builder'); fetchQuestions(t.id) }

  const handleBack = () => {
    if (level === 'builder') { setLevel('tests'); setSelectedTest(null); if (selectedUnit) fetchTests(selectedUnit.id) }
    else if (level === 'tests') { setLevel('units'); setSelectedUnit(null); if (selectedStandard) fetchUnits(selectedStandard.id) }
    else if (level === 'units') goStandards()
  }

  const handleAddUnit = async () => {
    if (!unitForm.name || !unitForm.unit_number || !selectedStandard) return
    setUnitSaving(true)
    await supabase.from('units').insert({ name: unitForm.name, unit_number: parseInt(unitForm.unit_number), standard_id: selectedStandard.id })
    setUnitForm({ name: '', unit_number: '' }); setUnitDialogOpen(false); setUnitSaving(false); fetchUnits(selectedStandard.id)
  }
  const handleDeleteUnit = async (uid: string) => { if (!confirm('Delete unit and all tests?')) return; await supabase.from('units').delete().eq('id', uid); if (selectedStandard) fetchUnits(selectedStandard.id) }

  const handleCreateTest = async () => {
    if (!testForm.title || !testForm.duration_minutes || !selectedUnit || !selectedStandard) return
    setTestSaving(true)
    await supabase.from('practice_tests').insert({
      title: testForm.title, description: testForm.description || null,
      duration_minutes: parseInt(testForm.duration_minutes),
      total_marks: testForm.total_marks ? parseInt(testForm.total_marks) : null,
      duration: `${testForm.duration_minutes} min`, questions_count: 0, is_published: false,
      unit_id: selectedUnit.id, standard_id: selectedStandard.id, uploaded_by: user?.id,
    })
    setTestForm({ title: '', duration_minutes: '', total_marks: '', description: '' }); setTestDialogOpen(false); setTestSaving(false); fetchTests(selectedUnit.id)
  }
  const handleDeleteTest = async (id: string) => { if (!confirm('Delete test and questions?')) return; await supabase.from('mcq_questions').delete().eq('test_id', id); await supabase.from('practice_tests').delete().eq('id', id); if (selectedUnit) fetchTests(selectedUnit.id) }

  const handleSaveQuestion = async () => {
    if (!qForm.question_text || !qForm.option_a || !qForm.option_b || !qForm.option_c || !qForm.option_d || !selectedTest) return
    setQSaving(true)
    const nextNum = editingQId ? (questions.find(q => q.id === editingQId)?.question_number || 1) : questions.length + 1
    const payload = { ...qForm, test_id: selectedTest.id, question_number: nextNum }
    if (editingQId) await supabase.from('mcq_questions').update(payload).eq('id', editingQId)
    else await supabase.from('mcq_questions').insert(payload)
    // Update count
    await supabase.from('practice_tests').update({ questions_count: editingQId ? questions.length : questions.length + 1 }).eq('id', selectedTest.id)
    setQForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }); setEditingQId(null); setQDialogOpen(false); setQSaving(false); fetchQuestions(selectedTest.id)
  }
  const handleEditQ = (q: McqQuestion) => { setQForm({ question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option }); setEditingQId(q.id); setQDialogOpen(true) }
  const handleDeleteQ = async (id: string) => {
    if (!confirm('Delete question?') || !selectedTest) return
    await supabase.from('mcq_questions').delete().eq('id', id)
    await supabase.from('practice_tests').update({ questions_count: Math.max(0, questions.length - 1) }).eq('id', selectedTest.id)
    fetchQuestions(selectedTest.id)
  }
  const handlePublish = async (publish: boolean) => {
    if (!selectedTest) return
    await supabase.from('practice_tests').update({ is_published: publish }).eq('id', selectedTest.id)
    setSelectedTest({ ...selectedTest, is_published: publish })
  }
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !selectedTest) return
    setDocUploading(true)
    const path = `tests/${selectedTest.id}/${Date.now()}_${file.name}`
    await supabase.storage.from('documents').upload(path, file)
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
    if (urlData) await supabase.from('practice_tests').update({ file_url: urlData.publicUrl }).eq('id', selectedTest.id)
    setDocUploading(false); setDocDialogOpen(false)
  }

  const getBreadcrumb = () => { const p = ['Standards']; if (selectedStandard) p.push(selectedStandard.name); if (selectedUnit) p.push(selectedUnit.name); if (selectedTest) p.push(selectedTest.title); return p.join(' > ') }
  const colors = ['from-blue-500 to-indigo-600','from-emerald-500 to-teal-600','from-purple-500 to-violet-600','from-orange-500 to-red-500','from-pink-500 to-rose-600','from-cyan-500 to-blue-600','from-amber-500 to-orange-600']

  return (
    <div className="min-h-screen">
      <AdminHeader title="Practice Tests" subtitle="Create and manage MCQ practice tests" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-sm">
          {level !== 'standards' && <button onClick={handleBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back</button>}
          <span className="text-muted-foreground font-medium">{getBreadcrumb()}</span>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

        : level === 'standards' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {standards.map((s, i) => (
              <Card key={s.id} className="stat-card-3d cursor-pointer border-0 shadow-md hover:shadow-xl overflow-hidden" onClick={() => goUnits(s)}>
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${colors[i % colors.length]} p-6 text-white`}>
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3"><span className="text-2xl font-black">{s.grade_number}</span></div>
                    <h3 className="text-lg font-bold">{s.name}</h3>
                  </div>
                  <div className="p-4"><p className="text-xs text-muted-foreground">Click to manage units →</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

        ) : level === 'units' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" />Units in {selectedStandard?.name}</h3>
              <Dialog open={unitDialogOpen} onOpenChange={o => { setUnitDialogOpen(o); if (!o) setUnitForm({ name: '', unit_number: '' }) }}>
                <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Unit</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Unit</DialogTitle><DialogDescription>For {selectedStandard?.name}</DialogDescription></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Unit Number *</Label><Input type="number" value={unitForm.unit_number} onChange={e => setUnitForm({ ...unitForm, unit_number: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Unit Name *</Label><Input value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} /></div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setUnitDialogOpen(false)}>Cancel</Button><Button onClick={handleAddUnit} disabled={unitSaving}>{unitSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add</Button></div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {units.length === 0 ? <div className="text-center py-16"><FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" /><h3 className="text-lg font-semibold mb-2">No Units Yet</h3></div>
            : <div className="grid gap-3">{units.map(u => (
              <Card key={u.id} className="stat-card-3d cursor-pointer hover:shadow-md"><CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1" onClick={() => goTests(u)}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><span className="text-lg font-bold text-primary">{u.unit_number}</span></div>
                  <div><p className="font-semibold">{u.name}</p><p className="text-xs text-muted-foreground">Unit {u.unit_number}</p></div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={e => { e.stopPropagation(); handleDeleteUnit(u.id) }}><Trash2 className="h-4 w-4" /></Button>
              </CardContent></Card>
            ))}</div>}
          </div>

        ) : level === 'tests' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2"><PenTool className="h-5 w-5 text-orange-600" />Tests — {selectedUnit?.name}</h3>
              <Dialog open={testDialogOpen} onOpenChange={o => { setTestDialogOpen(o); if (!o) setTestForm({ title: '', duration_minutes: '', total_marks: '', description: '' }) }}>
                <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Create Test</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Practice Test</DialogTitle><DialogDescription>Set up a new MCQ test</DialogDescription></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Test Name *</Label><Input placeholder="e.g., Grammar Quiz Unit 1" value={testForm.title} onChange={e => setTestForm({ ...testForm, title: e.target.value })} /></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><Label>Duration (minutes) *</Label><Input type="number" placeholder="30" value={testForm.duration_minutes} onChange={e => setTestForm({ ...testForm, duration_minutes: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Total Marks</Label><Input type="number" placeholder="50" value={testForm.total_marks} onChange={e => setTestForm({ ...testForm, total_marks: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea rows={2} value={testForm.description} onChange={e => setTestForm({ ...testForm, description: e.target.value })} /></div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setTestDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateTest} disabled={testSaving}>{testSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Test</Button></div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {tests.length === 0 ? <div className="text-center py-16"><PenTool className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" /><h3 className="text-lg font-semibold mb-2">No Tests Yet</h3><p className="text-muted-foreground">Create your first MCQ test</p></div>
            : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tests.map(t => (
              <Card key={t.id} className="stat-card-3d cursor-pointer hover:shadow-lg overflow-hidden" onClick={() => goBuilder(t)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10"><PenTool className="h-5 w-5 text-orange-600" /></div>
                    <Badge variant={t.is_published ? 'default' : 'outline'} className={t.is_published ? 'bg-accent text-accent-foreground' : ''}>{t.is_published ? 'Published' : 'Draft'}</Badge>
                  </div>
                  <h4 className="font-semibold mb-2 line-clamp-2">{t.title}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {t.duration_minutes && <Badge variant="secondary" className="text-xs"><Clock className="mr-1 h-3 w-3" />{t.duration_minutes} min</Badge>}
                    {t.total_marks && <Badge variant="secondary" className="text-xs">{t.total_marks} marks</Badge>}
                    <Badge variant="outline" className="text-xs">{t.questions_count || 0} Q</Badge>
                  </div>
                  <p className="text-xs text-primary font-medium mt-2">Click to manage questions →</p>
                </CardContent>
              </Card>
            ))}</div>}
          </div>

        ) : (
          /* BUILDER LEVEL */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><PenTool className="h-5 w-5 text-orange-600" />{selectedTest?.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTest?.duration_minutes && <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />{selectedTest.duration_minutes} min</Badge>}
                  {selectedTest?.total_marks && <Badge variant="secondary">{selectedTest.total_marks} marks</Badge>}
                  <Badge variant="outline">{questions.length} questions</Badge>
                  <Badge variant={selectedTest?.is_published ? 'default' : 'outline'} className={selectedTest?.is_published ? 'bg-accent text-accent-foreground' : ''}>{selectedTest?.is_published ? 'Published' : 'Draft'}</Badge>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                  <DialogTrigger asChild><Button variant="outline"><FileUp className="mr-2 h-4 w-4" />Upload Doc</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Upload Document</DialogTitle><DialogDescription>Upload a document to attach to this test. (Auto question generation coming soon)</DialogDescription></DialogHeader>
                    <div className="pt-4 space-y-4">
                      <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleDocUpload} disabled={docUploading} />
                      {docUploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Uploading...</div>}
                      <p className="text-xs text-muted-foreground">Supported: PDF, DOC, DOCX, TXT. Auto question extraction will be available in a future update.</p>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={qDialogOpen} onOpenChange={o => { setQDialogOpen(o); if (!o) { setEditingQId(null); setQForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }) } }}>
                  <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Question</Button></DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>{editingQId ? 'Edit' : 'Add'} Question</DialogTitle><DialogDescription>MCQ format with 4 options</DialogDescription></DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2"><Label>Question *</Label><Textarea rows={3} placeholder="Type your question here..." value={qForm.question_text} onChange={e => setQForm({ ...qForm, question_text: e.target.value })} /></div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2"><Label>Option A *</Label><Input value={qForm.option_a} onChange={e => setQForm({ ...qForm, option_a: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Option B *</Label><Input value={qForm.option_b} onChange={e => setQForm({ ...qForm, option_b: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Option C *</Label><Input value={qForm.option_c} onChange={e => setQForm({ ...qForm, option_c: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Option D *</Label><Input value={qForm.option_d} onChange={e => setQForm({ ...qForm, option_d: e.target.value })} /></div>
                      </div>
                      <div className="space-y-2">
                        <Label>Correct Answer *</Label>
                        <Select value={qForm.correct_option} onValueChange={v => setQForm({ ...qForm, correct_option: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem><SelectItem value="D">D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setQDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveQuestion} disabled={qSaving}>{qSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingQId ? 'Update' : 'Add'}</Button></div>
                    </div>
                  </DialogContent>
                </Dialog>

                {selectedTest?.is_published
                  ? <Button variant="outline" onClick={() => handlePublish(false)}><Eye className="mr-2 h-4 w-4" />Unpublish</Button>
                  : <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handlePublish(true)} disabled={questions.length === 0}><CheckCircle className="mr-2 h-4 w-4" />Publish Test</Button>
                }
              </div>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                <PenTool className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Questions Yet</h3>
                <p className="text-muted-foreground mb-4">Click &quot;Add Question&quot; to start building your MCQ test</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <Card key={q.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                            <p className="font-medium text-foreground">{q.question_text}</p>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 ml-9">
                            {(['A', 'B', 'C', 'D'] as const).map(opt => {
                              const val = q[`option_${opt.toLowerCase()}` as keyof McqQuestion] as string
                              const isCorrect = q.correct_option === opt
                              return (
                                <div key={opt} className={`text-sm px-3 py-2 rounded-lg border ${isCorrect ? 'bg-accent/10 border-accent text-accent font-medium' : 'bg-muted/30 border-border'}`}>
                                  <span className="font-semibold mr-2">{opt}.</span>{val}
                                  {isCorrect && <CheckCircle className="inline ml-2 h-3.5 w-3.5" />}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditQ(q)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteQ(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
