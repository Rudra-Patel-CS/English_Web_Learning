'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, BookOpen, ExternalLink, FolderOpen, GraduationCap, Loader2, Plus, Trash2, Edit, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Standard, Unit, TextBook } from '@/lib/types'

type ViewLevel = 'standards' | 'items'

export default function AdminTextbooksPage() {
  const { user } = useAuth()
  const [level, setLevel] = useState<ViewLevel>('standards')
  const [standards, setStandards] = useState<Standard[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [items, setItems] = useState<TextBook[]>([])
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null)
  const [loading, setLoading] = useState(true)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState({ title: '', description: '', file_url: '', chapter: '', author: '' })
  const [itemSaving, setItemSaving] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)

  useEffect(() => { fetchStandards() }, [])

  const fetchStandards = async () => {
    setLoading(true)
    const { data } = await supabase.from('standards').select('*').order('grade_number')
    if (data) setStandards(data)
    setLoading(false)
  }

  const fetchUnits = async (sid: string) => {
    const { data } = await supabase.from('units').select('*').eq('standard_id', sid).order('unit_number')
    if (data) setUnits(data)
  }

  const fetchItems = async (sid: string) => {
    const { data } = await supabase.from('text_books').select('*').eq('standard_id', sid).order('created_at', { ascending: false })
    if (data) setItems(data)
  }

  const handleSelectStandard = async (s: Standard) => {
    setSelectedStandard(s)
    setLevel('items')
    setLoading(true)
    await Promise.all([
      fetchUnits(s.id),
      fetchItems(s.id)
    ])
    setLoading(false)
  }

  const handleBack = () => {
    setLevel('standards')
    setSelectedStandard(null)
    setUnits([])
    setItems([])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileUploading(true)
    const path = `textbooks/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('documents').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
      if (urlData) setItemForm(f => ({ ...f, file_url: urlData.publicUrl }))
    }
    setFileUploading(false)
  }

  const handleSaveItem = async () => {
    if (!itemForm.title || !itemForm.file_url || !selectedStandard) return
    setItemSaving(true)
    const p = {
      title: itemForm.title,
      description: itemForm.description || null,
      file_url: itemForm.file_url,
      chapter: itemForm.chapter || null,
      author: itemForm.author || null,
      standard_id: selectedStandard.id,
      uploaded_by: user?.id
    }
    if (editingId) {
      await supabase.from('text_books').update(p).eq('id', editingId)
    } else {
      await supabase.from('text_books').insert(p)
    }
    setItemForm({ title: '', description: '', file_url: '', chapter: '', author: '' })
    setEditingId(null)
    setItemDialogOpen(false)
    setItemSaving(false)
    fetchItems(selectedStandard.id)
  }

  const handleEditItem = (t: TextBook) => {
    setItemForm({
      title: t.title,
      description: t.description || '',
      file_url: t.file_url,
      chapter: t.chapter || '',
      author: t.author || ''
    })
    setEditingId(t.id)
    setItemDialogOpen(true)
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this textbook?')) return
    await supabase.from('text_books').delete().eq('id', id)
    if (selectedStandard) fetchItems(selectedStandard.id)
  }

  const getBreadcrumb = () => {
    const p = ['Standards']
    if (selectedStandard) p.push(selectedStandard.name)
    return p.join(' > ')
  }

  const colors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-violet-600',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-amber-500 to-orange-600'
  ]

  return (
    <div className="min-h-screen">
      <AdminHeader title="Textbooks" subtitle="Manage textbook PDFs and reference materials" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-sm">
          {level !== 'standards' && (
            <button onClick={handleBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />Back
            </button>
          )}
          <span className="text-muted-foreground font-medium">{getBreadcrumb()}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : level === 'standards' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {standards.map((s, i) => (
              <Card key={s.id} className="stat-card-3d cursor-pointer border-0 shadow-md hover:shadow-xl overflow-hidden" onClick={() => handleSelectStandard(s)}>
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${colors[i % colors.length]} p-6 text-white`}>
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                      <span className="text-2xl font-black">{s.grade_number}</span>
                    </div>
                    <h3 className="text-lg font-bold">{s.name}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">Click to manage textbooks →</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Static Unit Reference List */}
            <div className="lg:col-span-1">
              <Card className="border border-border shadow-sm">
                <CardContent className="p-5">
                  <h3 className="text-base font-bold flex items-center gap-2 mb-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Standard Units List
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Reference list of all units in {selectedStandard?.name}. Textbooks are uploaded at the overall standard level.
                  </p>
                  {units.length === 0 ? (
                    <div className="text-center py-8 bg-muted/40 rounded-lg">
                      <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground">No units defined yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                      {units.map((u) => (
                        <div key={u.id} className="p-3 rounded-lg border border-border bg-card/60 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{u.unit_number}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate text-foreground">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">Unit {u.unit_number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Direct Textbook Uploads */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Textbooks — {selectedStandard?.name}
                </h3>
                <Dialog open={itemDialogOpen} onOpenChange={(o) => { setItemDialogOpen(o); if (!o) { setEditingId(null); setItemForm({ title: '', description: '', file_url: '', chapter: '', author: '' }) } }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />Add Textbook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit' : 'Add'} Textbook</DialogTitle>
                      <DialogDescription>PDF or document link for {selectedStandard?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>PDF/File URL *</Label>
                        <Input placeholder="https://..." value={itemForm.file_url} onChange={(e) => setItemForm({ ...itemForm, file_url: e.target.value })} />
                        <div className="text-xs text-muted-foreground text-center">— or upload a file —</div>
                        <div className="flex items-center gap-2">
                          <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} disabled={fileUploading} className="text-xs" />
                          {fileUploading && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
                        </div>
                        {itemForm.file_url && <p className="text-xs text-emerald-600 flex items-center gap-1"><Upload className="h-3 w-3" />File URL set</p>}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Chapter</Label>
                          <Input value={itemForm.chapter} onChange={(e) => setItemForm({ ...itemForm, chapter: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Author</Label>
                          <Input value={itemForm.author} onChange={(e) => setItemForm({ ...itemForm, author: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea rows={2} value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveItem} disabled={itemSaving}>
                          {itemSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingId ? 'Update' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Textbooks Yet</h3>
                  <p className="text-muted-foreground text-sm">Add textbooks directly to this standard using the "Add Textbook" button.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((t) => (
                    <Card key={t.id} className="hover:shadow-md border border-border">
                      <CardContent className="p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 mb-3">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-1 line-clamp-2">{t.title}</h4>
                        {t.author && <p className="text-xs text-muted-foreground mb-1">By {t.author}</p>}
                        {t.chapter && <p className="text-xs text-muted-foreground mb-2">Ch: {t.chapter}</p>}
                        {t.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.description}</p>}
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                            <a href={t.file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1 h-3 w-3" />View PDF
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditItem(t)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteItem(t.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
