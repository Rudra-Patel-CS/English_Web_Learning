'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BookOpen, ChevronRight, FileQuestion, FolderOpen, Plus, Search, Video } from 'lucide-react'

const mockStandards = [
  { id: '1', name: 'STD 6', subjects: 5, chapters: 32, questions: 450 },
  { id: '2', name: 'STD 7', subjects: 5, chapters: 35, questions: 520 },
  { id: '3', name: 'STD 8', subjects: 6, chapters: 42, questions: 680 },
  { id: '4', name: 'STD 9', subjects: 6, chapters: 48, questions: 780 },
  { id: '5', name: 'STD 10', subjects: 7, chapters: 56, questions: 920 },
  { id: '6', name: 'STD 12', subjects: 5, chapters: 45, questions: 850 },
]

export default function StandardsPage() {
  const [standards, setStandards] = useState(mockStandards)
  const [searchQuery, setSearchQuery] = useState('')
  const [newStandard, setNewStandard] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredStandards = standards.filter(std =>
    std.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddStandard = () => {
    if (newStandard.trim()) {
      const newId = (standards.length + 1).toString()
      setStandards([...standards, {
        id: newId,
        name: newStandard.trim(),
        subjects: 0,
        chapters: 0,
        questions: 0,
      }])
      setNewStandard('')
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Standards" subtitle="Manage classes and grades" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search standards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Standard
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Standard</DialogTitle>
                <DialogDescription>
                  Create a new class/grade for organizing study materials.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="standard-name">Standard Name</Label>
                  <Input
                    id="standard-name"
                    placeholder="e.g., STD 11"
                    value={newStandard}
                    onChange={(e) => setNewStandard(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStandard}>
                    Add Standard
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Standards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStandards.map((standard) => (
            <Link key={standard.id} href={`/admin/standards/${standard.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <FolderOpen className="h-6 w-6 text-primary" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl mt-3">{standard.name}</CardTitle>
                  <CardDescription>
                    {standard.subjects} subjects available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted p-2">
                      <BookOpen className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                      <p className="text-lg font-semibold">{standard.chapters}</p>
                      <p className="text-xs text-muted-foreground">Chapters</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <FileQuestion className="h-4 w-4 mx-auto text-green-600 mb-1" />
                      <p className="text-lg font-semibold">{standard.questions}</p>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <Video className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                      <p className="text-lg font-semibold">{Math.floor(standard.chapters * 1.5)}</p>
                      <p className="text-xs text-muted-foreground">Videos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredStandards.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No standards found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Add your first standard to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
