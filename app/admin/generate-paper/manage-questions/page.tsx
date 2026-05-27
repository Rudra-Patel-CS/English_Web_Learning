'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import type { Question, Standard, Unit } from '@/lib/types'
import { Loader2, Plus, Trash2, Upload, ChevronRight, BookOpen } from 'lucide-react'

type SubQuestion = {
  id: string
  question: string
  answer: string
  marks: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const STANDARDS = ['9', '10', '11', '12']

const INSTRUCTION_TYPES_WITH_UNITS = [
  'Paragraph base question(Textbook)',
  'True or False',
  'Stanza Base Question(Poem) – 2mark',
  'Stanza Base Question(Poem) – 3mark',
  'Opposite meaning',
  'Paragraph base question(Dolphin) 4 mark',
  'Paragraph base question(Dolphin) – 5 mark',
  'Fill in the blanks (Textbook) 3 mark',
  'Fill in the blanks (Textbook) 4 mark',
  'Fill in the blanks (Textbook) 5 mark',
]

const DO_AS_DIRECTED_INSTRUCTIONS = [
  'Change the person',
  'Change the number',
  'Change the gender',
  'Change the tense',
  'Change the Voice',
]

const INSTRUCTION_TYPES_WITHOUT_UNITS = [
  ...DO_AS_DIRECTED_INSTRUCTIONS,
  'Frame the questions',
  'Essay',
  'Email',
  'Report',
  'Picture description',
  'Short Note',
]

const LONG_RESPONSE_INSTRUCTIONS = [
  'Essay',
  'Email',
  'Report',
  'Picture description',
  'Short Note',
]

const PASSAGE_INSTRUCTION_TYPES = [
  'Paragraph base question(Textbook)',
  'Stanza Base Question(Poem) – 2mark',
  'Stanza Base Question(Poem) – 3mark',
  'Paragraph base question(Dolphin) 4 mark',
  'Paragraph base question(Dolphin) – 5 mark',
]

const HIDE_OPTIONS_INSTRUCTION_TYPES = [
  ...PASSAGE_INSTRUCTION_TYPES,
  'True or False',
  ...DO_AS_DIRECTED_INSTRUCTIONS,
]

const FILL_IN_THE_BLANKS_INSTRUCTIONS = [
  'Fill in the blanks (Textbook) 3 mark',
  'Fill in the blanks (Textbook) 4 mark',
  'Fill in the blanks (Textbook) 5 mark',
]

const getInstructionLabel = (type: string) => {
  if (type === 'Opposite meaning') return 'Nearest meaning'
  if (type === 'Frame the questions') return 'Wh Frame Question'
  return type
}

const parseBracketedOptions = (text: string) => {
  const match = text.match(/\(([^)]+)\)/)
  if (!match) return []
  return match[1]
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean)
}

export default function ManageQuestionsPage() {
  const [standards, setStandards] = useState<Standard[]>([])
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null)
  const [selectedInstruction, setSelectedInstruction] = useState<string>('')
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [units, setUnits] = useState<Unit[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('add')

  // Form state
  const [questionText, setQuestionText] = useState('')
  const [passageText, setPassageText] = useState('')
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    { id: 'sub-1', question: '', answer: '', marks: '1', difficulty: 'medium' },
  ])
  const [answer, setAnswer] = useState('')
  const [tfAnswer, setTfAnswer] = useState<'True' | 'False'>('True')
  const [marks, setMarks] = useState('1')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [options, setOptions] = useState<string[]>([])
  const [questionImage, setQuestionImage] = useState<File | null>(null)
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)

  const hasUnits = INSTRUCTION_TYPES_WITH_UNITS.includes(selectedInstruction)
  const isPassageInstruction = PASSAGE_INSTRUCTION_TYPES.includes(selectedInstruction)
  const isFillInTheBlanks = FILL_IN_THE_BLANKS_INSTRUCTIONS.includes(selectedInstruction)
  const isNearestMeaning = selectedInstruction === 'Opposite meaning'
  const isPictureDescription = selectedInstruction === 'Picture description'
  const isLongResponseInstruction = LONG_RESPONSE_INSTRUCTIONS.includes(selectedInstruction)
  const isWhFrameQuestion = selectedInstruction === 'Frame the questions'
  const isDoAsDirected = DO_AS_DIRECTED_INSTRUCTIONS.includes(selectedInstruction)
  const isWhFrameOptionStandard = isWhFrameQuestion && selectedStandard && [9, 10, 11, 12].includes(selectedStandard.grade_number)
  const isWhFrameTextStandard = isWhFrameQuestion && selectedStandard && [6, 7, 8].includes(selectedStandard.grade_number)
  const showOptions =
    selectedInstruction !== '' &&
    !HIDE_OPTIONS_INSTRUCTION_TYPES.includes(selectedInstruction) &&
    !(isWhFrameQuestion && selectedStandard && [6, 7, 8].includes(selectedStandard.grade_number))

  useEffect(() => {
    fetchStandards()
  }, [])

  useEffect(() => {
    if (selectedStandard && selectedInstruction && hasUnits) {
      fetchUnits()
    } else {
      setUnits([])
      setSelectedUnit('')
    }
  }, [selectedStandard, selectedInstruction])

  useEffect(() => {
    if (selectedStandard && selectedInstruction) {
      if (hasUnits && !selectedUnit) return
      fetchQuestions()
    }
  }, [selectedStandard, selectedInstruction, selectedUnit])

  const handleStandardChange = (value: string) => {
    const standard = standards.find((s) => s.id === value) || {
      id: value,
      name: value,
      grade_number: parseInt(value) || 0,
    }
    setSelectedStandard(standard)
    setSelectedInstruction('')
    setSelectedUnit('')
    setPassageText('')
    setQuestionText('')
    setSubQuestions([{ id: 'sub-1', question: '', answer: '', marks: '1', difficulty: 'medium' }])
    setQuestions([])
  }

  const handleInstructionChange = (value: string) => {
    setSelectedInstruction(value)
    setSelectedUnit('')
    if (!PASSAGE_INSTRUCTION_TYPES.includes(value)) {
      setPassageText('')
      setSubQuestions([{ id: 'sub-1', question: '', answer: '', marks: '1', difficulty: 'medium' }])
    }
    setQuestionText('')
    setAnswer('')
  }

  const fetchStandards = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('standards').select('*').order('grade_number', { ascending: true })
      if (error) throw error
      if (data) setStandards(data)
    } catch (error) {
      console.error('Error fetching standards:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseQuestionsFromText = (text: string): Array<{ question_text: string; answer: string }> => {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim()
    if (!normalized) return []

    const cleanLine = (line: string) => line.replace(/^\*+|\*+$/g, '').replace(/^\s*-\s*/, '').replace(/\*\*/g, '').trim()

    const parseSection = (sectionText: string) => {
      const lines = sectionText.split('\n').map((line) => cleanLine(line)).filter(Boolean)
      const blocks: Array<{ question: string; answer: string }> = []
      const passageLines: string[] = []
      let currentQuestion: { question: string; answer: string } | null = null
      let waitingForAnswer = false

      const flushQuestion = () => {
        if (currentQuestion) {
          blocks.push({ question: currentQuestion.question.trim(), answer: currentQuestion.answer.trim() })
          currentQuestion = null
          waitingForAnswer = false
        }
      }

      for (const line of lines) {
        const questionMatch = line.match(/^(\d+)[\.)]\s*(.*)/)
        const answerHeaderMatch = line.match(/^(Answer|Ans)[:\s-]*$/i)
        const answerInlineMatch = line.match(/^(Answer|Ans)[:\s-]*\s*(.*)$/i)

        if (questionMatch) {
          flushQuestion()
          currentQuestion = { question: questionMatch[2].trim(), answer: "" }
          waitingForAnswer = false
          continue
        }

        if (answerInlineMatch && currentQuestion) {
          currentQuestion.answer += answerInlineMatch[2].trim() + " "
          waitingForAnswer = true
          continue
        }

        if (answerHeaderMatch && currentQuestion) {
          waitingForAnswer = true
          continue
        }

        if (waitingForAnswer && currentQuestion) {
          currentQuestion.answer += line + " "
          continue
        }

        if (currentQuestion && !waitingForAnswer) {
          currentQuestion.question += " " + line
          continue
        }

        passageLines.push(line)
      }

      flushQuestion()
      return { passage: passageLines.join(" "), blocks }
    }

    const sectionRegex = /(?:^|\n)(Paragraph|Stanza|Passage)\s*\d*.*\n([\s\S]*?)(?=(?:\n(?:Paragraph|Stanza|Passage)\s*\d*.*\n)|$)/gim
    const parsedQuestions: Array<{ question_text: string; answer: string }> = []
    let match: RegExpExecArray | null = null
    let foundSection = false

    while ((match = sectionRegex.exec(normalized)) !== null) {
      foundSection = true
      const sectionContent = match[2] || ""
      const { passage, blocks } = parseSection(sectionContent)
      blocks.forEach((block) => {
        const questionText = passage ? passage + "\n\n" + block.question : block.question
        parsedQuestions.push({ question_text: questionText, answer: block.answer.trim() })
      })
    }

    if (!foundSection) {
      const { passage, blocks } = parseSection(normalized)
      blocks.forEach((block) => {
        const questionText = passage ? passage + "\n\n" + block.question : block.question
        parsedQuestions.push({ question_text: questionText, answer: block.answer.trim() })
      })
    }

    return parsedQuestions
  }

  const groupPassageQuestions = (items: Question[]) => {
    const groups = new Map<string, Question[]>()

    items.forEach((question) => {
      const parts = question.question_text.split(/\n\s*\n/u)
      const passage = parts.length > 1 ? parts[0].trim() : ''
      const questionLine = parts.length > 1 ? parts.slice(1).join('\n\n').trim() : question.question_text.trim()
      const key = passage || 'default'
      const current = groups.get(key) || []
      current.push({ ...question, question_text: questionLine })
      groups.set(key, current)
    })

    return Array.from(groups.entries()).map(([passage, items]) => ({ passage, items }))
  }

  const parseFileQuestions = async (file: File): Promise<Array<{ question_text: string; answer: string }>> => {
    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.txt')) {
      const text = await file.text()
      return parseQuestionsFromText(text)
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/parse-doc', {
      method: 'POST',
      body: formData,
    })

    let data: any = null
    try {
      data = await response.json()
    } catch (parseError) {
      throw new Error(`Unable to parse document response (status ${response.status})`)
    }

    if (!response.ok) {
      const message = data?.error || data?.message || `Unable to parse document (${response.status})`
      throw new Error(message)
    }

    if (data?.error) {
      throw new Error(data.error)
    }

    return data.questions || []
  }

  const handleBulkFileUpload = async (file: File) => {
    setUploadMessage('')
    setUploadLoading(true)

    try {
      if (!selectedStandard || !selectedInstruction || (hasUnits && !selectedUnit)) {
        setUploadMessage('Please select standard, instruction type, and unit (if required) before uploading.')
        return
      }

      const supportedFormats = ['.txt', '.pdf', '.docx', '.doc']
      const isSupported = supportedFormats.some((ext) => file.name.toLowerCase().endsWith(ext))
      if (!isSupported) {
        setUploadMessage('Supported upload formats are .txt, .pdf, .docx, and .doc.')
        return
      }

      const parsed = await parseFileQuestions(file)
      if (parsed.length === 0) {
        setUploadMessage('No questions could be parsed. Please use the correct paragraph and numbered question format.')
        return
      }

      // If this instruction type uses units, ensure the selected unit exists in question_units
      let ensuredUnit: { id: string | null; name: string } | null = null
      if (hasUnits && selectedUnit) {
        ensuredUnit = await ensureQuestionUnit(selectedUnit)
        if (!ensuredUnit?.id) {
          setUploadMessage('Unable to resolve or create unit for upload. Please check unit selection.')
          return
        }
      }

      const standardValue = selectedStandard?.grade_number?.toString() || selectedStandard?.name || ''
      const insertPayload = parsed.map((item: { question_text: string; answer: string }) => ({
        standard: standardValue,
        instruction_type: selectedInstruction,
        unit_id: hasUnits && selectedUnit ? ensuredUnit?.id : null,
        unit_name: hasUnits && selectedUnit ? ensuredUnit?.name : null,
        question_text: item.question_text,
        answer: item.answer || 'Answer not provided',
        marks: parseInt(marks) || 1,
        difficulty,
        options: selectedInstruction === 'True or False' ? ['True', 'False'] : [],
        created_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('questions').insert(insertPayload)
      if (error) {
        const message = error.message || error.details || error.hint || 'Failed to upload questions from file.'
        console.error('Bulk upload error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
        setUploadMessage(message)
        return
      }

      await fetchQuestions()
      setUploadMessage(`Uploaded ${insertPayload.length} questions successfully.`)
    } catch (caughtError: any) {
      const message = caughtError instanceof Error ? caughtError.message : JSON.stringify(caughtError)
      console.error('Bulk upload parse error:', message, caughtError)
      setUploadMessage(message || 'An error occurred while uploading the file.')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleBulkFileUpload(file)
    e.target.value = ''
  }

  const handleQuestionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setQuestionImage(file)
    setQuestionImagePreview(URL.createObjectURL(file))
  }

  const removeQuestionImage = () => {
    setQuestionImage(null)
    setQuestionImagePreview(null)
  }

  const fetchUnits = async () => {
    if (!selectedStandard || !selectedInstruction) return
    setLoading(true)
    try {
      const standardValue = selectedStandard?.grade_number?.toString() || selectedStandard?.name || ''
      const { data, error } = await supabase
        .from('question_units')
        .select('id, unit_name')
        .eq('standard', standardValue)
        .eq('instruction_type', selectedInstruction)
        .order('unit_name', { ascending: true })

      if (error) throw error
      const mappedUnits = (data || []).map((unit: any) => ({
        id: unit.id,
        name: unit.unit_name,
      }))
      setUnits(mappedUnits)
    } catch (error) {
      console.error(
        'Error fetching units:',
        error && typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2) : error
      )
    } finally {
      setLoading(false)
    }
  }

  // Ensure a matching question_units record exists (create if missing) and return its id and name
  const ensureQuestionUnit = async (unitIdOrName: string) => {
    try {
      const unitName = units.find((u) => u.id === unitIdOrName)?.name || unitIdOrName
      const standardValue = selectedStandard?.grade_number?.toString() || selectedStandard?.name || ''

      const res = await fetch('/api/question-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standard: standardValue, instruction_type: selectedInstruction, unit_name: unitName }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Failed to ensure question_unit:', res.status, errText)
        return { id: null, name: unitName }
      }

      const payload = await res.json()
      const created = payload?.data || (Array.isArray(payload) ? payload[0] : payload)
      return { id: created?.id || null, name: created?.unit_name || created?.name || unitName }
    } catch (err) {
      console.error('ensureQuestionUnit error:', err)
      return { id: null, name: unitIdOrName }
    }
  }

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const standardValue = selectedStandard?.grade_number?.toString() || selectedStandard?.name || ''
      let query = supabase
        .from('questions')
        .select('*')
        .eq('standard', standardValue)
        .eq('instruction_type', selectedInstruction)

      if (hasUnits && selectedUnit) {
        query = query.eq('unit_id', selectedUnit)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStandard || !selectedInstruction) {
      alert('Please select standard and instruction type first.')
      return
    }

    if (isPassageInstruction && !passageText.trim()) {
      alert('Please add the passage or paragraph first.')
      return
    }

    if (!isPassageInstruction && !questionText.trim()) {
      alert('Please enter the question text.')
      return
    }

    setSubmitting(true)
    try {
      const payload = []

      if (isPassageInstruction) {
        const validSubQuestions = subQuestions.filter((sub) => sub.question.trim() && sub.answer.trim())
        if (validSubQuestions.length === 0) {
          alert('Please add at least one sub-question and answer for the paragraph.')
          setSubmitting(false)
          return
        }

        // ensure unit exists in question_units and get id
        let ensuredUnitForAdd: { id: string | null; name: string } | null = null
        if (hasUnits && selectedUnit) {
          ensuredUnitForAdd = await ensureQuestionUnit(selectedUnit)
          if (!ensuredUnitForAdd?.id) {
            alert('Unable to resolve or create unit. Please check unit selection.')
            setSubmitting(false)
            return
          }
        }
        validSubQuestions.forEach((sub) => {
          payload.push({
            standard: selectedStandard?.grade_number?.toString() || selectedStandard?.name || '',
            instruction_type: selectedInstruction,
            unit_id: hasUnits && selectedUnit ? ensuredUnitForAdd?.id : null,
            unit_name: hasUnits && selectedUnit ? ensuredUnitForAdd?.name : null,
            question_text: `${passageText.trim()}

${sub.question.trim()}`,
            answer: sub.answer.trim(),
            marks: parseInt(sub.marks) || 1,
            difficulty: sub.difficulty,
            options: selectedInstruction === 'True or False' ? ['True', 'False'] : [],
            created_at: new Date().toISOString(),
          })
        })
      } else {
        // ensure unit exists in question_units and get id for non-passage questions
        var ensuredUnitForAddNonPassage: { id: string | null; name: string } | null = null
        if (hasUnits && selectedUnit) {
          ensuredUnitForAddNonPassage = await ensureQuestionUnit(selectedUnit)
          if (!ensuredUnitForAddNonPassage?.id) {
            alert('Unable to resolve or create unit. Please check unit selection.')
            setSubmitting(false)
            return
          }
        }

        let effectiveOptions: string[] = selectedInstruction === 'True or False' ? ['True', 'False'] : showOptions ? options.filter((o) => o.trim()) : []
        if (isFillInTheBlanks && effectiveOptions.length === 0) {
          effectiveOptions = parseBracketedOptions(questionText)
        }

        let finalAnswer = selectedInstruction === 'True or False' ? tfAnswer : answer.trim()
        if (isNearestMeaning) {
          if (!effectiveOptions.length) {
            alert('Please add at least one option for nearest meaning.')
            setSubmitting(false)
            return
          }
          if (!finalAnswer) {
            alert('Please select the correct option for nearest meaning.')
            setSubmitting(false)
            return
          }
        }

        payload.push({
          standard: selectedStandard?.grade_number?.toString() || selectedStandard?.name || '',
          instruction_type: selectedInstruction,
          unit_id: hasUnits && selectedUnit ? ensuredUnitForAddNonPassage?.id : null,
          unit_name: hasUnits && selectedUnit ? ensuredUnitForAddNonPassage?.name : null,
          question_text: questionText.trim(),
          answer: finalAnswer,
          marks: parseInt(marks) || 1,
          difficulty,
          options: effectiveOptions,
          created_at: new Date().toISOString(),
        })
      }

      const { error } = await supabase.from('questions').insert(payload)

      if (error) throw error

      // Reset form values; keep passage text when adding multiple questions for the same paragraph
      if (!isPassageInstruction) {
        setPassageText('')
      }
      setQuestionText('')
      setAnswer('')
      setTfAnswer('True')
      setMarks('1')
      setDifficulty('medium')
      setOptions(['', '', '', ''])

      await fetchQuestions()
      alert('Question added successfully!')
    } catch (error) {
      console.error('Error adding question:', error)
      if (error && typeof error === 'object') {
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      }
      alert('Failed to add question')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const { error } = await supabase.from('questions').delete().eq('id', questionId)

      if (error) throw error

      setQuestions(questions.filter(q => q.id !== questionId))
      alert('Question deleted successfully')
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    }
  }

  return (
    <div className="min-h-screen pb-12 bg-background">
      <AdminHeader
        title="Manage Questions"
        subtitle="Add and manage question bank for generating papers"
      />

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Selection Section */}
          <Card className="shadow-sm border-muted/60">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Select Standard *</Label>
                  <Select value={selectedStandard?.id || ''} onValueChange={handleStandardChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose standard" />
                    </SelectTrigger>
                    <SelectContent>
                      {standards.length > 0 ? (
                        standards.map((std) => (
                          <SelectItem key={std.id} value={std.id}>
                            {std.name || `Standard ${std.grade_number}`}
                          </SelectItem>
                        ))
                      ) : (
                        STANDARDS.map((std) => (
                          <SelectItem key={std} value={std}>
                            Standard {std}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Instruction Type *</Label>
                  <Select value={selectedInstruction} onValueChange={handleInstructionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose instruction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">WITH UNITS</div>
                      {INSTRUCTION_TYPES_WITH_UNITS.map(type => (
                        <SelectItem key={type} value={type}>
                          {getInstructionLabel(type)}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">WITHOUT UNITS</div>
                      {INSTRUCTION_TYPES_WITHOUT_UNITS.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasUnits && (
                  <div className="space-y-2">
                    <Label>Select Unit *</Label>
                    <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                      <SelectTrigger disabled={units.length === 0}>
                        <SelectValue placeholder={loading ? 'Loading...' : 'Choose unit'} />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Once you select the standard and instruction type, you can add multiple questions for the same context without reselecting.
                Change the instruction only when you want to add another question type.
              </div>
            </CardContent>
          </Card>

          {selectedStandard && selectedInstruction && (!hasUnits || selectedUnit) && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">
                  <Plus className="h-4 w-4 mr-2" /> Add Question
                </TabsTrigger>
                <TabsTrigger value="list">
                  <BookOpen className="h-4 w-4 mr-2" /> Questions ({questions.length})
                </TabsTrigger>
              </TabsList>

              {/* Add Question Tab */}
              <TabsContent value="add">
                <Card className="shadow-sm border-muted/60">
                  <CardContent className="p-6">
                    <form onSubmit={handleAddQuestion} className="space-y-5">
                      {isPassageInstruction ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="passage">Write the paragraph *</Label>
                            <Textarea
                              id="passage"
                              placeholder="Enter the paragraph or passage here..."
                              rows={6}
                              value={passageText}
                              onChange={(e) => setPassageText(e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold">Sub-Questions</p>
                                <p className="text-xs text-muted-foreground">Add multiple questions and answers for the same paragraph.</p>
                              </div>
                              <Button type="button" variant="outline" onClick={() => setSubQuestions((current) => [...current, { id: `sub-${Date.now()}`, question: '', answer: '', marks: '1', difficulty: 'medium' }])}>
                                Add subquestion
                              </Button>
                            </div>

                            <div className="space-y-4">
                              {subQuestions.map((sub, idx) => (
                                <div key={sub.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                                  <div className="flex items-center justify-between gap-4 mb-4">
                                    <div>
                                      <p className="text-sm font-semibold">Sub-question {idx + 1}</p>
                                    </div>
                                    {subQuestions.length > 1 && (
                                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setSubQuestions((current) => current.filter((_, index) => index !== idx))}>
                                        Remove
                                      </Button>
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <div className="space-y-2">
                                      <Label>Question {idx + 1}</Label>
                                      <Textarea
                                        rows={3}
                                        value={sub.question}
                                        onChange={(e) => setSubQuestions((current) => current.map((item, itemIndex) => itemIndex === idx ? { ...item, question: e.target.value } : item))}
                                        placeholder={`Enter sub-question ${idx + 1}...`}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Answer {idx + 1}</Label>
                                      <Textarea
                                        rows={3}
                                        value={sub.answer}
                                        onChange={(e) => setSubQuestions((current) => current.map((item, itemIndex) => itemIndex === idx ? { ...item, answer: e.target.value } : item))}
                                        placeholder={`Enter answer for question ${idx + 1}...`}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Marks</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={sub.marks}
                                        onChange={(e) => setSubQuestions((current) => current.map((item, itemIndex) => itemIndex === idx ? { ...item, marks: e.target.value } : item))}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="question">Question Text *</Label>
                            <Textarea
                              id="question"
                              placeholder={isFillInTheBlanks ? 'Paste the full fill-in-the-blanks text here, including any bracketed choices like (isolated, clusters, lighter)' : 'Enter the question...'}
                              rows={isLongResponseInstruction ? 8 : 6}
                              value={questionText}
                              onChange={(e) => setQuestionText(e.target.value)}
                              required
                            />
                          </div>

                          {isFillInTheBlanks && (
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
                              <p className="font-semibold mb-1">Fill in the Blanks Instructions</p>
                              <p className="mb-1">Enter the complete instruction and sentence together in one input. If you include bracketed options such as <code>(isolated, clusters, lighter)</code>, they will be detected automatically.</p>
                              <p>Then enter the correct blank answers in order, separated by commas.</p>
                            </div>
                          )}

                          {(selectedInstruction === 'True or False' || isDoAsDirected || isWhFrameQuestion) && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-900">
                                {selectedInstruction === 'True or False'
                                  ? 'This question type has fixed options: True, False. Select the correct answer.'
                                  : isWhFrameTextStandard
                                  ? 'Wh Frame Question (standards 6–8): enter the full question prompt with underlined words, then type the multiline answer below.'
                                  : isWhFrameOptionStandard
                                  ? 'Wh Frame Question (standards 9–12): enter the question, then add the options below and select the correct option.'
                                  : 'Enter the full Do as directed prompt in the question box, then add answer and marks below.'}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="answer">Answer *</Label>
                              {selectedInstruction === 'True or False' ? (
                                <Select value={tfAnswer} onValueChange={(val: any) => setTfAnswer(val)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="True">True</SelectItem>
                                    <SelectItem value="False">False</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : isNearestMeaning || isWhFrameOptionStandard ? (
                                <>
                                  <Select value={answer} onValueChange={(val: any) => setAnswer(val)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={options.filter(Boolean).length > 0 ? 'Select the correct option' : 'Add options first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {options.filter(Boolean).map((opt, idx) => (
                                        <SelectItem key={idx} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">Enter the question text above, then add choice options below and pick the correct one from this list.</p>
                                </>
                              ) : (
                                <Textarea
                                  id="answer"
                                  placeholder={isFillInTheBlanks ? 'Enter blank answers in order, separated by commas (e.g. isolated, clusters, lighter)' : isLongResponseInstruction ? 'Enter the long form answer or response here...' : 'Enter the correct answer...'}
                                  rows={isLongResponseInstruction ? 10 : 3}
                                  value={answer}
                                  onChange={(e) => setAnswer(e.target.value)}
                                  required
                                />
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="marks">Marks *</Label>
                              <Input
                                id="marks"
                                type="number"
                                min="1"
                                max="10"
                                value={marks}
                                onChange={(e) => setMarks(e.target.value)}
                              />
                            </div>
                          </div>

                          {showOptions && (
                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                              <div className="flex items-center justify-between gap-4">
                                <Label>Options</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => setOptions((current) => [...current, ''])}>
                                  Add option
                                </Button>
                              </div>
                              {options.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Click Add option to add choices.</p>
                              ) : (
                                <div className="space-y-2">
                                  {options.map((opt, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_auto] gap-3">
                                      <Input
                                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                        value={opt}
                                        onChange={(e) => {
                                          const newOpts = [...options]
                                          newOpts[idx] = e.target.value
                                          setOptions(newOpts)
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setOptions((current) => current.filter((_, index) => index !== idx))}
                                        className="text-destructive"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {isNearestMeaning && (
                                <p className="text-xs text-muted-foreground">Add the choice words here and select the correct answer from the dropdown above.</p>
                              )}
                              {isFillInTheBlanks && (
                                <p className="text-xs text-muted-foreground">If the bracketed option list is included in the question text, it will populate automatically on submit if no options are entered here.</p>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Add Question
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* File Upload Section */}
                <Card className="shadow-sm border-muted/60 mt-6">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Upload className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Bulk Upload Questions</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload a formatted <strong>.txt</strong> file. The file should use paragraph headings and numbered questions, like the example below.
                      </p>
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-sm text-slate-700">
                        <p className="font-semibold mb-2">Expected format:</p>
                        <pre className="whitespace-pre-wrap text-xs leading-5">
Paragraph 1
Long long ago a Zulu hunter was sitting under a tree...
1. Who was Edie and what was he doing?
2. Where were the deer?

Paragraph 2
He said to himself...
1. What problem did Edie face?
2. How did the cheetah catch the deer?
                        </pre>
                      </div>
                      <Input type="file" accept=".txt,.pdf,.docx,.doc" onChange={handleFileInputChange} className="cursor-pointer" />
                      <div className="text-sm text-muted-foreground">
                        Upload a file in <strong>.txt</strong>, <strong>.pdf</strong>, <strong>.docx</strong>, or <strong>.doc</strong> format. Answers are best provided after the question as <strong>Answer:</strong>.
                      </div>
                      {uploadMessage && (
                        <div className="rounded-md border px-4 py-3 text-sm bg-slate-50 border-slate-200 text-slate-800">
                          {uploadMessage}
                        </div>
                      )}
                      {uploadLoading && (
                        <div className="text-sm text-muted-foreground">Parsing and inserting questions... please wait.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Questions List Tab */}
              <TabsContent value="list">
                <Card className="shadow-sm border-muted/60">
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : questions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No questions found for this selection.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {isPassageInstruction ? (
                          groupPassageQuestions(questions).map((group, groupIndex) => (
                            <div key={`group-${groupIndex}`} className="border rounded-lg p-4 hover:bg-accent/5 transition">
                              <div className="mb-4">
                                <p className="text-sm font-semibold mb-2">Passage</p>
                                <p className="whitespace-pre-wrap text-sm text-slate-800">{group.passage}</p>
                              </div>
                              <div className="space-y-4">
                                {group.items.map((q, idx) => (
                                  <div key={q.id} className="rounded-lg border border-slate-200 p-4 bg-white">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                          Q{idx + 1}
                                        </span>
                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                          {q.marks} marks
                                        </span>
                                        {q.difficulty && (
                                          <span className={`text-xs px-2 py-1 rounded ${
                                            q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                            q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                          }`}>
                                            {q.difficulty}
                                          </span>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <p className="font-medium mb-2 whitespace-pre-wrap">{q.question_text}</p>
                                    <p className="text-sm text-muted-foreground"><strong>Answer:</strong> {q.answer}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          questions.map((q, idx) => (
                            <div key={q.id} className="border rounded-lg p-4 hover:bg-accent/5 transition">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      Q{idx + 1}
                                    </span>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                      {q.marks} marks
                                    </span>
                                    {q.difficulty && (
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {q.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-medium mb-2 whitespace-pre-wrap">{q.question_text}</p>
                                  <p className="text-sm text-muted-foreground"><strong>Answer:</strong> {q.answer}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Empty state */}
          {!selectedStandard || !selectedInstruction || (hasUnits && !selectedUnit) && (
            <Card className="shadow-sm border-muted/60 border-dashed">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a standard, instruction type{hasUnits ? ' and unit' : ''} to begin managing questions.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
