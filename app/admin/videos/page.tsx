'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Video, ExternalLink, FolderOpen, GraduationCap, Loader2, Plus, Trash2, Edit, Link as LinkIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Standard, Unit, VideoLink } from '@/lib/types'

type ViewLevel = 'standards' | 'units' | 'items'

export default function AdminVideosPage() {
  const { user } = useAuth()
  const [level, setLevel] = useState<ViewLevel>('standards')
  const [standards, setStandards] = useState<Standard[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [items, setItems] = useState<VideoLink[]>([])
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)
  const [unitDialogOpen, setUnitDialogOpen] = useState(false)
  const [unitForm, setUnitForm] = useState({ name: '', unit_number: '' })
  const [unitSaving, setUnitSaving] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState({ title: '', video_url: '', description: '', chapter: '', duration: '' })
  const [itemSaving, setItemSaving] = useState(false)

  useEffect(() => { fetchStandards() }, [])

  const fetchStandards = async () => { setLoading(true); const { data } = await supabase.from('standards').select('*').order('grade_number'); if (data) setStandards(data); setLoading(false) }
  const fetchUnits = async (sid: string) => { setLoading(true); const { data } = await supabase.from('units').select('*').eq('standard_id', sid).order('unit_number'); if (data) setUnits(data); setLoading(false) }
  const fetchItems = async (uid: string) => { setLoading(true); const { data } = await supabase.from('video_links').select('*').eq('unit_id', uid).order('created_at', { ascending: false }); if (data) setItems(data); setLoading(false) }

  const handleSelectStandard = (s: Standard) => { setSelectedStandard(s); setLevel('units'); fetchUnits(s.id) }
  const handleSelectUnit = (u: Unit) => { setSelectedUnit(u); setLevel('items'); fetchItems(u.id) }
  const handleBack = () => { if (level === 'items') { setLevel('units'); setSelectedUnit(null); if (selectedStandard) fetchUnits(selectedStandard.id) } else { setLevel('standards'); setSelectedStandard(null) } }

  const handleAddUnit = async () => {
    if (!unitForm.name || !unitForm.unit_number || !selectedStandard) return
    setUnitSaving(true)
    await supabase.from('units').insert({ name: unitForm.name, unit_number: parseInt(unitForm.unit_number), standard_id: selectedStandard.id })
    setUnitForm({ name: '', unit_number: '' }); setUnitDialogOpen(false); setUnitSaving(false); fetchUnits(selectedStandard.id)
  }

  const handleDeleteUnit = async (uid: string) => { if (!confirm('Delete this unit?')) return; await supabase.from('video_links').delete().eq('unit_id', uid); await supabase.from('units').delete().eq('id', uid); if (selectedStandard) fetchUnits(selectedStandard.id) }

  const handleSaveItem = async () => {
    if (!itemForm.title || !itemForm.video_url || !selectedUnit || !selectedStandard) return
    setItemSaving(true)
    const p = { title: itemForm.title, video_url: itemForm.video_url, description: itemForm.description || null, chapter: itemForm.chapter || null, duration: itemForm.duration || null, unit_id: selectedUnit.id, standard_id: selectedStandard.id, uploaded_by: user?.id }
    if (editingId) await supabase.from('video_links').update(p).eq('id', editingId); else await supabase.from('video_links').insert(p)
    setItemForm({ title: '', video_url: '', description: '', chapter: '', duration: '' }); setEditingId(null); setItemDialogOpen(false); setItemSaving(false); fetchItems(selectedUnit.id)
  }

  const handleEditItem = (v: VideoLink) => { setItemForm({ title: v.title, video_url: v.video_url, description: v.description || '', chapter: v.chapter || '', duration: v.duration || '' }); setEditingId(v.id); setItemDialogOpen(true) }
  const handleDeleteItem = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('video_links').delete().eq('id', id); if (selectedUnit) fetchItems(selectedUnit.id) }

  const getBreadcrumb = () => { const p = ['Standards']; if (selectedStandard) p.push(selectedStandard.name); if (selectedUnit) p.push(selectedUnit.name); return p.join(' > ') }
  const colors = ['from-blue-500 to-indigo-600','from-emerald-500 to-teal-600','from-purple-500 to-violet-600','from-orange-500 to-red-500','from-pink-500 to-rose-600','from-cyan-500 to-blue-600','from-amber-500 to-orange-600']

  return (
    <div className="min-h-screen">
      <AdminHeader title="Video Links" subtitle="Manage video tutorials by standard and unit" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-sm">
          {level !== 'standards' && <button onClick={handleBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back</button>}
          <span className="text-muted-foreground font-medium">{getBreadcrumb()}</span>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        : level === 'standards' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {standards.map((s, i) => (
              <Card key={s.id} className="stat-card-3d cursor-pointer border-0 shadow-md hover:shadow-xl overflow-hidden" onClick={() => handleSelectStandard(s)}>
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
              <Dialog open={unitDialogOpen} onOpenChange={(o) => { setUnitDialogOpen(o); if (!o) setUnitForm({ name: '', unit_number: '' }) }}>
                <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Unit</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Unit</DialogTitle><DialogDescription>For {selectedStandard?.name}</DialogDescription></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Unit Number *</Label><Input type="number" value={unitForm.unit_number} onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Unit Name *</Label><Input value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} /></div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setUnitDialogOpen(false)}>Cancel</Button><Button onClick={handleAddUnit} disabled={unitSaving}>{unitSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add</Button></div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {units.length === 0 ? <div className="text-center py-16"><FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" /><h3 className="text-lg font-semibold mb-2">No Units Yet</h3><p className="text-muted-foreground">Add units to organize videos</p></div>
            : <div className="grid gap-3">{units.map((u) => (
              <Card key={u.id} className="stat-card-3d cursor-pointer hover:shadow-md"><CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1" onClick={() => handleSelectUnit(u)}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><span className="text-lg font-bold text-primary">{u.unit_number}</span></div>
                  <div><p className="font-semibold">{u.name}</p><p className="text-xs text-muted-foreground">Unit {u.unit_number}</p></div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteUnit(u.id) }}><Trash2 className="h-4 w-4" /></Button>
              </CardContent></Card>
            ))}</div>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2"><Video className="h-5 w-5 text-purple-600" />Videos — {selectedUnit?.name}</h3>
              <Dialog open={itemDialogOpen} onOpenChange={(o) => { setItemDialogOpen(o); if (!o) { setEditingId(null); setItemForm({ title: '', video_url: '', description: '', chapter: '', duration: '' }) } }}>
                <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Video</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Video</DialogTitle><DialogDescription>Add a video link</DialogDescription></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Title *</Label><Input value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Video URL *</Label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="https://youtube.com/..." value={itemForm.video_url} onChange={(e) => setItemForm({ ...itemForm, video_url: e.target.value })} /></div></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><Label>Chapter</Label><Input value={itemForm.chapter} onChange={(e) => setItemForm({ ...itemForm, chapter: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Duration</Label><Input placeholder="15:30" value={itemForm.duration} onChange={(e) => setItemForm({ ...itemForm, duration: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea rows={2} value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} /></div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveItem} disabled={itemSaving}>{itemSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingId ? 'Update' : 'Add'}</Button></div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {items.length === 0 ? <div className="text-center py-16"><Video className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" /><h3 className="text-lg font-semibold mb-2">No Videos Yet</h3></div>
            : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((v) => (
              <Card key={v.id} className="hover:shadow-md overflow-hidden"><CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center relative">
                  <div className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center"><Video className="h-6 w-6 text-purple-600" /></div>
                  {v.duration && <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{v.duration}</div>}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-2 line-clamp-2">{v.title}</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild><a href={v.video_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-3 w-3" />Watch</a></Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditItem(v)}><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteItem(v.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent></Card>
            ))}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
