'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, FileText, ExternalLink, FolderOpen, GraduationCap, Loader2, Plus, Trash2, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Standard, Unit, ReadingMaterial } from '@/lib/types'

type ViewLevel = 'standards' | 'units' | 'items'

export default function AdminReadingPage() {
  const { user } = useAuth()
  const [level, setLevel] = useState<ViewLevel>('standards')
  const [standards, setStandards] = useState<Standard[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [items, setItems] = useState<ReadingMaterial[]>([])
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)

  // Unit dialog
  const [unitDialogOpen, setUnitDialogOpen] = useState(false)
  const [unitForm, setUnitForm] = useState({ name: '', unit_number: '' })
  const [unitSaving, setUnitSaving] = useState(false)

  // Item dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState({ title: '', description: '', file_url: '', chapter: '' })
  const [itemSaving, setItemSaving] = useState(false)

  useEffect(() => {
    fetchStandards()
  }, [])

  const fetchStandards = async () => {
    setLoading(true)
    const { data } = await supabase.from('standards').select('*').order('grade_number')
    if (data) setStandards(data)
    setLoading(false)
  }

  const fetchUnits = async (standardId: string) => {
    setLoading(true)
    const { data } = await supabase.from('units').select('*').eq('standard_id', standardId).order('unit_number')
    if (data) setUnits(data)
    setLoading(false)
  }

  const fetchItems = async (unitId: string) => {
    setLoading(true)
    const { data } = await supabase.from('reading_materials').select('*').eq('unit_id', unitId).order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }

  const handleSelectStandard = (std: Standard) => {
    setSelectedStandard(std)
    setLevel('units')
    fetchUnits(std.id)
  }

  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit)
    setLevel('items')
    fetchItems(unit.id)
  }

  const handleBack = () => {
    if (level === 'items') {
      setLevel('units')
      setSelectedUnit(null)
      if (selectedStandard) fetchUnits(selectedStandard.id)
    } else if (level === 'units') {
      setLevel('standards')
      setSelectedStandard(null)
    }
  }

  const handleAddUnit = async () => {
    if (!unitForm.name || !unitForm.unit_number || !selectedStandard) return
    setUnitSaving(true)
    await supabase.from('units').insert({
      name: unitForm.name,
      unit_number: parseInt(unitForm.unit_number),
      standard_id: selectedStandard.id,
    })
    setUnitForm({ name: '', unit_number: '' })
    setUnitDialogOpen(false)
    setUnitSaving(false)
    fetchUnits(selectedStandard.id)
  }

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Delete this unit and all its materials?')) return
    await supabase.from('reading_materials').delete().eq('unit_id', unitId)
    await supabase.from('units').delete().eq('id', unitId)
    if (selectedStandard) fetchUnits(selectedStandard.id)
  }

  const handleSaveItem = async () => {
    if (!itemForm.title || !selectedUnit || !selectedStandard) return
    setItemSaving(true)
    const payload = {
      title: itemForm.title,
      description: itemForm.description || null,
      file_url: itemForm.file_url || null,
      chapter: itemForm.chapter || null,
      unit_id: selectedUnit.id,
      standard_id: selectedStandard.id,
      uploaded_by: user?.id,
    }
    if (editingId) {
      await supabase.from('reading_materials').update(payload).eq('id', editingId)
    } else {
      await supabase.from('reading_materials').insert(payload)
    }
    setItemForm({ title: '', description: '', file_url: '', chapter: '' })
    setEditingId(null)
    setItemDialogOpen(false)
    setItemSaving(false)
    fetchItems(selectedUnit.id)
  }

  const handleEditItem = (item: ReadingMaterial) => {
    setItemForm({ title: item.title, description: item.description || '', file_url: item.file_url || '', chapter: item.chapter || '' })
    setEditingId(item.id)
    setItemDialogOpen(true)
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this reading material?')) return
    await supabase.from('reading_materials').delete().eq('id', id)
    if (selectedUnit) fetchItems(selectedUnit.id)
  }

  const getBreadcrumb = () => {
    const parts = ['Standards']
    if (selectedStandard) parts.push(selectedStandard.name)
    if (selectedUnit) parts.push(selectedUnit.name)
    return parts.join(' > ')
  }

  const standardColors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-violet-600',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-amber-500 to-orange-600',
  ]

  return (
    <div className="min-h-screen">
      <AdminHeader title="Reading Materials" subtitle="Manage reading materials by standard and unit" />

      <div className="p-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {level !== 'standards' && (
            <button onClick={handleBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <span className="text-muted-foreground font-medium">{getBreadcrumb()}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : level === 'standards' ? (
          /* Standards Level */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {standards.map((std, i) => (
              <Card key={std.id} className="stat-card-3d cursor-pointer border-0 shadow-md hover:shadow-xl overflow-hidden" onClick={() => handleSelectStandard(std)}>
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${standardColors[i % standardColors.length]} p-6 text-white`}>
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                      <span className="text-2xl font-black">{std.grade_number}</span>
                    </div>
                    <h3 className="text-lg font-bold">{std.name}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">Click to manage units →</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : level === 'units' ? (
          /* Units Level */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Units in {selectedStandard?.name}
              </h3>
              <Dialog open={unitDialogOpen} onOpenChange={(o) => { setUnitDialogOpen(o); if (!o) setUnitForm({ name: '', unit_number: '' }) }}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Add Unit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Unit</DialogTitle>
                    <DialogDescription>Create a new unit for {selectedStandard?.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Unit Number *</Label>
                      <Input type="number" placeholder="1" value={unitForm.unit_number} onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Name *</Label>
                      <Input placeholder="e.g., Tenses & Grammar" value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddUnit} disabled={unitSaving}>
                        {unitSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Unit
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {units.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Units Yet</h3>
                <p className="text-muted-foreground mb-4">Add units to organize reading materials</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {units.map((unit) => (
                  <Card key={unit.id} className="stat-card-3d cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1" onClick={() => handleSelectUnit(unit)}>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{unit.unit_number}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{unit.name}</p>
                          <p className="text-xs text-muted-foreground">Unit {unit.unit_number} • Click to view materials</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id) }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Items Level */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Reading Materials — {selectedUnit?.name}
              </h3>
              <Dialog open={itemDialogOpen} onOpenChange={(o) => { setItemDialogOpen(o); if (!o) { setEditingId(null); setItemForm({ title: '', description: '', file_url: '', chapter: '' }) } }}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Add Material</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit' : 'Add'} Reading Material</DialogTitle>
                    <DialogDescription>Add a reading material to {selectedUnit?.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Title *</Label><Input value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} /></div>
                    <div className="space-y-2"><Label>File URL</Label><Input placeholder="https://..." value={itemForm.file_url} onChange={(e) => setItemForm({ ...itemForm, file_url: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Chapter</Label><Input value={itemForm.chapter} onChange={(e) => setItemForm({ ...itemForm, chapter: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} /></div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveItem} disabled={itemSaving}>
                        {itemSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingId ? 'Update' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Materials Yet</h3>
                <p className="text-muted-foreground">Add reading materials for this unit</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 mb-3">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1 line-clamp-2">{item.title}</h4>
                      {item.chapter && <p className="text-xs text-muted-foreground mb-2">Chapter: {item.chapter}</p>}
                      {item.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>}
                      <div className="flex gap-2 mt-auto">
                        {item.file_url && (
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-3 w-3" />View</a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-3 w-3" /></Button>
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
