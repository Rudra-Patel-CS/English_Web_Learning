'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, FileQuestion, Filter, Plus, Search, Trash2 } from 'lucide-react'

const questionTypes = [
  { id: 'mcq', name: 'MCQ' },
  { id: 'short', name: 'Short Answer' },
  { id: 'long', name: 'Long Answer' },
  { id: 'fill', name: 'Fill in the Blanks' },
  { id: 'true-false', name: 'True/False' },
  { id: 'match', name: 'Match the Following' },
  { id: 'direct-indirect', name: 'Direct/Indirect Speech' },
  { id: 'active-passive', name: 'Active/Passive Voice' },
  { id: 'nearest-meaning', name: 'Nearest Meaning' },
  { id: 'do-as-directed', name: 'Do as Directed' },
]

const mockQuestions = [
  {
    id: '1',
    text: 'Convert the following sentence to indirect speech: He said, "I am going to the market."',
    type: 'direct-indirect',
    standard: 'STD 6',
    subject: 'English',
    chapter: 'Direct & Indirect Speech',
    marks: 2,
    difficulty: 'medium',
  },
  {
    id: '2',
    text: 'Change the voice: The cat chased the mouse.',
    type: 'active-passive',
    standard: 'STD 6',
    subject: 'English',
    chapter: 'Active & Passive Voice',
    marks: 2,
    difficulty: 'easy',
  },
  {
    id: '3',
    text: 'Find the nearest meaning of "enormous".',
    type: 'nearest-meaning',
    standard: 'STD 6',
    subject: 'English',
    chapter: 'Vocabulary',
    marks: 1,
    difficulty: 'easy',
  },
  {
    id: '4',
    text: 'Write a short paragraph about your favorite festival.',
    type: 'long',
    standard: 'STD 6',
    subject: 'English',
    chapter: 'Writing Skills',
    marks: 5,
    difficulty: 'medium',
  },
  {
    id: '5',
    text: 'Fill in the blank: The sun ___ in the east.',
    type: 'fill',
    standard: 'STD 6',
    subject: 'English',
    chapter: 'Grammar',
    marks: 1,
    difficulty: 'easy',
  },
]

export default function QuestionsPage() {
  const [questions, setQuestions] = useState(mockQuestions)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: '',
    standard: '',
    subject: '',
    chapter: '',
    marks: 1,
    difficulty: 'medium',
    answer: '',
  })

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || q.type === filterType
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty
    return matchesSearch && matchesType && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const handleAddQuestion = () => {
    if (newQuestion.text && newQuestion.type) {
      const question = {
        id: (questions.length + 1).toString(),
        text: newQuestion.text,
        type: newQuestion.type,
        standard: newQuestion.standard || 'STD 6',
        subject: newQuestion.subject || 'English',
        chapter: newQuestion.chapter || 'General',
        marks: newQuestion.marks,
        difficulty: newQuestion.difficulty,
      }
      setQuestions([question, ...questions])
      setNewQuestion({
        text: '',
        type: '',
        standard: '',
        subject: '',
        chapter: '',
        marks: 1,
        difficulty: 'medium',
        answer: '',
      })
      setIsAddDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Question Bank" subtitle="Manage all questions" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileQuestion className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{questions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <FileQuestion className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{questions.filter(q => q.difficulty === 'easy').length}</p>
                  <p className="text-sm text-muted-foreground">Easy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <FileQuestion className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{questions.filter(q => q.difficulty === 'medium').length}</p>
                  <p className="text-sm text-muted-foreground">Medium</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                  <FileQuestion className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{questions.filter(q => q.difficulty === 'hard').length}</p>
                  <p className="text-sm text-muted-foreground">Hard</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {questionTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>
                  Create a new question for the question bank.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Standard</Label>
                    <Select 
                      value={newQuestion.standard} 
                      onValueChange={(v) => setNewQuestion({...newQuestion, standard: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STD 6">STD 6</SelectItem>
                        <SelectItem value="STD 7">STD 7</SelectItem>
                        <SelectItem value="STD 8">STD 8</SelectItem>
                        <SelectItem value="STD 9">STD 9</SelectItem>
                        <SelectItem value="STD 10">STD 10</SelectItem>
                        <SelectItem value="STD 12">STD 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select 
                      value={newQuestion.subject} 
                      onValueChange={(v) => setNewQuestion({...newQuestion, subject: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select 
                      value={newQuestion.type} 
                      onValueChange={(v) => setNewQuestion({...newQuestion, type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chapter</Label>
                    <Input
                      placeholder="Enter chapter name"
                      value={newQuestion.chapter}
                      onChange={(e) => setNewQuestion({...newQuestion, chapter: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter your question here..."
                    rows={4}
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={newQuestion.marks}
                      onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select 
                      value={newQuestion.difficulty} 
                      onValueChange={(v) => setNewQuestion({...newQuestion, difficulty: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Answer (Optional)</Label>
                  <Textarea
                    placeholder="Enter the answer..."
                    rows={2}
                    value={newQuestion.answer}
                    onChange={(e) => setNewQuestion({...newQuestion, answer: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddQuestion}>
                    Add Question
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
            <CardDescription>All questions in the bank</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-start justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground">{question.text}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{question.standard}</Badge>
                      <Badge variant="outline">{question.subject}</Badge>
                      <Badge variant="secondary">
                        {questionTypes.find(t => t.id === question.type)?.name || question.type}
                      </Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline">{question.marks} marks</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="text-center py-8">
                  <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No questions found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
