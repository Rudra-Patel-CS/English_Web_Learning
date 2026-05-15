'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { HelpCircle, Edit, Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { FAQ } from '@/lib/types'

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ question: '', answer: '', sort_order: '0', is_active: true })

  const fetchData = async () => {
    const { data } = await supabase.from('faq').select('*').order('sort_order')
    if (data) setFaqs(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    if (!form.question || !form.answer) return
    setSaving(true)
    const payload = { question: form.question, answer: form.answer, sort_order: parseInt(form.sort_order) || 0, is_active: form.is_active }
    if (editingId) {
      await supabase.from('faq').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingId)
    } else {
      await supabase.from('faq').insert(payload)
    }
    setForm({ question: '', answer: '', sort_order: '0', is_active: true })
    setEditingId(null)
    setIsDialogOpen(false)
    setSaving(false)
    fetchData()
  }

  const handleEdit = (faq: FAQ) => {
    setForm({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order?.toString() || '0', is_active: faq.is_active !== false })
    setEditingId(faq.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return
    await supabase.from('faq').delete().eq('id', id)
    fetchData()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('faq').update({ is_active: !current }).eq('id', id)
    fetchData()
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="FAQ Management" subtitle="Manage frequently asked questions displayed on the public FAQ page" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{faqs.length} FAQs total · {faqs.filter(f => f.is_active).length} active</p>
          <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) { setEditingId(null); setForm({ question: '', answer: '', sort_order: '0', is_active: true }) } }}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add FAQ</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} FAQ</DialogTitle>
                <DialogDescription>This will appear on the public FAQ page.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Question *</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
                <div className="space-y-2"><Label>Answer *</Label><Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    <Label>Active</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingId ? 'Update' : 'Add'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : faqs.length === 0 ? (
          <div className="text-center py-12"><HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">No FAQs yet</h3><p className="text-muted-foreground">Add FAQs for the public page</p></div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.id} className={`transition-all ${!faq.is_active ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={faq.is_active !== false} onCheckedChange={() => toggleActive(faq.id, faq.is_active !== false)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(faq)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(faq.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
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
