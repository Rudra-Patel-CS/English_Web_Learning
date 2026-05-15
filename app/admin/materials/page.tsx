'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Download, Edit, FileText, Loader2, Plus, Search, Trash2, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { MaterialItem, Standard } from '@/lib/types'

export default function MaterialsPage() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [standards, setStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStandard, setFilterStandard] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', file_url: '', file_type: 'pdf', standard_id: '', chapter: '' })

  const fetchData = async () => {
    const [mRes, sRes] = await Promise.all([
      supabase.from('materials').select('*, standards(name)').order('created_at', { ascending: false }),
      supabase.from('standards').select('*').order('grade_number'),
    ])
    if (mRes.data) setMaterials(mRes.data as MaterialItem[])
    if (sRes.data) setStandards(sRes.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    if (!form.title || !form.standard_id) return
    setSaving(true)
    const payload = { ...form, uploaded_by: user?.id }
    if (editingId) {
      await supabase.from('materials').update(payload).eq('id', editingId)
    } else {
      await supabase.from('materials').insert(payload)
    }
    setForm({ title: '', description: '', file_url: '', file_type: 'pdf', standard_id: '', chapter: '' })
    setEditingId(null)
    setIsDialogOpen(false)
    setSaving(false)
    fetchData()
  }

  const handleEdit = (m: MaterialItem) => {
    setForm({ title: m.title, description: m.description || '', file_url: m.file_url || '', file_type: m.file_type || 'pdf', standard_id: m.standard_id, chapter: m.chapter || '' })
    setEditingId(m.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return
    await supabase.from('materials').delete().eq('id', id)
    fetchData()
  }

  const filtered = materials.filter(m => {
    const s = m.title.toLowerCase().includes(searchQuery.toLowerCase())
    const f = filterStandard === 'all' || m.standard_id === filterStandard
    return s && f
  })

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'doc': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Materials" subtitle="Manage study materials" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search materials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStandard} onValueChange={setFilterStandard}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Standards" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Standards</SelectItem>
                {standards.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) { setEditingId(null); setForm({ title: '', description: '', file_url: '', file_type: 'pdf', standard_id: '', chapter: '' }) } }}>
            <DialogTrigger asChild><Button><Upload className="mr-2 h-4 w-4" />Upload Material</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Upload'} Material</DialogTitle>
                <DialogDescription>Add study material for students.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>File URL</Label><Input placeholder="Link to file" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Standard *</Label>
                    <Select value={form.standard_id} onValueChange={(v) => setForm({ ...form, standard_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{standards.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>File Type</Label>
                    <Select value={form.file_type} onValueChange={(v) => setForm({ ...form, file_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="doc">Document</SelectItem>
                        <SelectItem value="ppt">Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Chapter</Label><Input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingId ? 'Update' : 'Upload'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : filtered.length === 0 ? (
          <div className="text-center py-12"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">No materials found</h3></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <Card key={m.id} className="hover:border-primary/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900"><FileText className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
                    <Badge className={getTypeColor(m.file_type)}>{(m.file_type || 'pdf').toUpperCase()}</Badge>
                  </div>
                  <h3 className="font-semibold mb-1 line-clamp-2">{m.title}</h3>
                  <Badge variant="outline" className="text-xs mb-3">{(m.standards as unknown as Standard)?.name || ''}</Badge>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(m)}><Edit className="mr-1 h-3 w-3" />Edit</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
