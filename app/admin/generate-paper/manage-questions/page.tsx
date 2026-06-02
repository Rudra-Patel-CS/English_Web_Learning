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
import { parsePassageGroups, parseToFlatQuestions, validateAndRepair } from '@/lib/passage-parser'
import type { Question, Standard, Unit } from '@/lib/types'
import { Loader2, Plus, Trash2, Upload, ChevronRight, BookOpen, Eye, CheckCircle, X, FileText, AlertCircle, CheckSquare, Square } from 'lucide-react'

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
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'preview' | 'inserting' | 'done' | 'error'>('idle')
  const [previewQuestions, setPreviewQuestions] = useState<Array<{ question_text: string; answer: string; options?: string[] }>>([])
  const [previewGroups, setPreviewGroups] = useState<Array<{ passage: string; questions: Array<{ question: string; answer: string }> }>>([])
  const [uploadFileName, setUploadFileName] = useState('')

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

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
    if (selectedStandard) {
      fetchUnits()
    } else {
      setUnits([])
      setSelectedUnit('')
    }
  }, [selectedStandard])

  useEffect(() => {
    if (selectedStandard && selectedInstruction) {
      if (hasUnits && !selectedUnit) return
      fetchQuestions()
    }
  }, [selectedStandard, selectedInstruction, selectedUnit])

  // Clear selection whenever the question list changes
  useEffect(() => {
    setSelectedIds(new Set())
  }, [questions])

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

  const cleanFormatting = (text: string): string => {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*{1,3}/g, '')
      .replace(/_{1,3}/g, ' ')
      .replace(/^\s*[-*]\s+/gm, '')
      .split('\n')
      .map((l) => l.trimEnd())
      .join('\n')
      .trim()
  }

  // ─── Passage / Paragraph / Stanza parser ───
  const parsePassageText = (text: string): Array<{ question_text: string; answer: string }> => {
    const normalized = cleanFormatting(text)
    if (!normalized) return []

    // ── Inner helper: parse one section (passage prose + its numbered Q&A) ──
    const parseSection = (sectionText: string) => {
      const lines = sectionText.split('\n').filter((l) => l.trim())
      const passageLines: string[] = []
      const blocks: Array<{ question: string; answer: string }> = []
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
        const trimmed = line.trim()
        const questionMatch = trimmed.match(/^(\d+)[\.)]\s+(.*)/)
        const answerInlineMatch = trimmed.match(/^(Answer|Ans)[:\s\-]*\s*(.+)$/i)
        const answerHeaderMatch = trimmed.match(/^(Answer|Ans)[:\s\-]*$/i)

        if (questionMatch) {
          flushQuestion()
          currentQuestion = { question: questionMatch[2].trim(), answer: '' }
          waitingForAnswer = false
          continue
        }

        if (answerInlineMatch && currentQuestion) {
          currentQuestion.answer += answerInlineMatch[2].trim() + ' '
          waitingForAnswer = true
          continue
        }

        if (answerHeaderMatch && currentQuestion) {
          waitingForAnswer = true
          continue
        }

        if (waitingForAnswer && currentQuestion) {
          currentQuestion.answer += trimmed + ' '
          continue
        }

        if (currentQuestion && !waitingForAnswer) {
          currentQuestion.question += ' ' + trimmed
          continue
        }

        passageLines.push(trimmed)
      }

      flushQuestion()
      return { passage: passageLines.join(' ').trim(), blocks }
    }

    const parsedQuestions: Array<{ question_text: string; answer: string }> = []

    // ── Strategy 1: explicit "Paragraph N / Stanza N / Passage N" headers ──
    const sectionRegex = /(?:^|\n)(Paragraph|Stanza|Passage)\s*\d*[^\n]*\n([\s\S]*?)(?=(?:\n(?:Paragraph|Stanza|Passage)\s*\d*[^\n]*\n)|$)/gim
    let match: RegExpExecArray | null = null
    let foundSection = false

    while ((match = sectionRegex.exec(normalized)) !== null) {
      foundSection = true
      const { passage, blocks } = parseSection(match[2] || '')
      blocks.forEach((block) => {
        parsedQuestions.push({
          question_text: passage ? `${passage}\n\n${block.question}` : block.question,
          answer: block.answer.trim(),
        })
      })
    }

    if (foundSection) return parsedQuestions.filter((q) => q.question_text.trim())

    // ── Strategy 2: structural detection (no explicit headers) ────────────────
    // Split lines into "prose" blocks and "qa" blocks separated by blank lines,
    // then pair each prose block with the Q&A block that follows it.
    const allLines = normalized.split('\n')
    const startsNumbered = (l: string) => /^\d+[\.)]\s+/.test(l.trim())

    type RawBlock = { kind: 'prose' | 'qa'; lines: string[] }
    const rawBlocks: RawBlock[] = []
    let cur: RawBlock | null = null

    for (const rawLine of allLines) {
      const trimmed = rawLine.trim()
      if (!trimmed) {
        if (cur) { rawBlocks.push(cur); cur = null }
        continue
      }
      const kind: 'prose' | 'qa' = startsNumbered(trimmed) ? 'qa' : 'prose'
      if (!cur) {
        cur = { kind, lines: [trimmed] }
      } else if (cur.kind === kind) {
        cur.lines.push(trimmed)
      } else {
        rawBlocks.push(cur)
        cur = { kind, lines: [trimmed] }
      }
    }
    if (cur) rawBlocks.push(cur)

    let pendingPassage = ''
    for (const block of rawBlocks) {
      if (block.kind === 'prose') {
        pendingPassage += (pendingPassage ? ' ' : '') + block.lines.join(' ')
      } else {
        const { blocks: qBlocks } = parseSection(block.lines.join('\n'))
        qBlocks.forEach((qb) => {
          parsedQuestions.push({
            question_text: pendingPassage ? `${pendingPassage}\n\n${qb.question}` : qb.question,
            answer: qb.answer.trim() || 'Answer not provided',
          })
        })
        pendingPassage = ''
      }
    }

    if (parsedQuestions.length > 0) return parsedQuestions.filter((q) => q.question_text.trim())

    // ── Strategy 3: last resort — whole text as one section ──
    const { passage, blocks: fallbackBlocks } = parseSection(normalized)
    fallbackBlocks.forEach((block) => {
      parsedQuestions.push({
        question_text: passage ? `${passage}\n\n${block.question}` : block.question,
        answer: block.answer.trim(),
      })
    })

    return parsedQuestions.filter((q) => q.question_text.trim())
  }

  // ─── True / False parser ───
  const parseTrueFalseText = (text: string): Array<{ question_text: string; answer: string; options: string[] }> => {
    const normalized = cleanFormatting(text)
    const results: Array<{ question_text: string; answer: string; options: string[] }> = []
    const lines = normalized.split('\n').filter((l) => l.trim())
    const passageLines: string[] = []
    let currentStatement = ''
    let expectAnswer = false
    let hasSeenNumbered = false

    const flush = (ans?: string) => {
      if (currentStatement.trim()) {
        const cleaned = currentStatement.replace(/_{2,}/g, '').trim()
        results.push({
          question_text: passageLines.length > 0 ? `${passageLines.join(' ')}\n\n${cleaned}` : cleaned,
          answer: ans || 'True',
          options: ['True', 'False'],
        })
      }
      currentStatement = ''
      expectAnswer = false
    }

    for (const line of lines) {
      const trimmed = line.trim()
      const numMatch = trimmed.match(/^(\d+)[\.)]\s+(.*)/)
      const answerMatch = trimmed.match(/^(?:Answer|Ans)\s*[:\-–—.\s]*(.*)$/i)

      if (numMatch) {
        flush()
        hasSeenNumbered = true
        const stmtText = numMatch[2].trim()
        const tfEndMatch = stmtText.match(/^(.*?)[\s_]*\b(True|False)\s*$/i)
        if (tfEndMatch) {
          flush()
          const stmt = tfEndMatch[1].replace(/_{2,}/g, '').trim()
          results.push({
            question_text: passageLines.length > 0 ? `${passageLines.join(' ')}\n\n${stmt}` : stmt,
            answer: tfEndMatch[2].charAt(0).toUpperCase() + tfEndMatch[2].slice(1).toLowerCase(),
            options: ['True', 'False'],
          })
          currentStatement = ''
        } else {
          currentStatement = stmtText
          expectAnswer = true
        }
        continue
      }

      if (answerMatch && currentStatement) {
        const ans = answerMatch[1]?.trim()
        if (/^true$/i.test(ans)) { flush('True'); continue }
        if (/^false$/i.test(ans)) { flush('False'); continue }
      }

      if (expectAnswer && /^(True|False)\s*$/i.test(trimmed)) {
        flush(trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase())
        continue
      }

      if (!hasSeenNumbered && !currentStatement && results.length === 0) {
        passageLines.push(trimmed)
        continue
      }

      if (currentStatement) {
        currentStatement += ' ' + trimmed
      }
    }

    flush()
    return results.filter((q) => q.question_text.trim())
  }

  // ─── Fill in the blanks parser ───
  const parseFillBlanksText = (text: string): Array<{ question_text: string; answer: string; options: string[] }> => {
    const normalized = cleanFormatting(text)
    const results: Array<{ question_text: string; answer: string; options: string[] }> = []
    const lines = normalized.split('\n').filter((l) => l.trim())
    const passageLines: string[] = []
    let currentQuestion = ''
    let currentOptions: string[] = []
    let currentAnswer = ''
    let expectAnswer = false
    let hasSeenNumbered = false

    const flush = () => {
      if (currentQuestion.trim()) {
        if (currentOptions.length === 0) {
          const optMatch = currentQuestion.match(/\(([^)]+)\)\s*$/)
          if (optMatch) {
            currentOptions = optMatch[1].split(/[\/,]/).map((o) => o.trim()).filter(Boolean)
            currentQuestion = currentQuestion.replace(/\(([^)]+)\)\s*$/, '').trim()
          }
        }
        results.push({
          question_text: passageLines.length > 0 ? `${passageLines.join(' ')}\n\n${currentQuestion.trim()}` : currentQuestion.trim(),
          answer: currentAnswer.trim() || 'Answer not provided',
          options: currentOptions,
        })
      }
      currentQuestion = ''
      currentOptions = []
      currentAnswer = ''
      expectAnswer = false
    }

    for (const line of lines) {
      const trimmed = line.trim()
      const numMatch = trimmed.match(/^(\d+)[\.)]\s+(.*)/)
      const answerMatch = trimmed.match(/^(?:Answer|Ans)\s*[:\-–—.\s]*(.*)$/i)
      const bracketMatch = trimmed.match(/^\(([^)]+)\)$/)

      if (numMatch) {
        flush()
        hasSeenNumbered = true
        currentQuestion = numMatch[2].trim()
        continue
      }

      if (answerMatch) {
        const ans = answerMatch[1]?.trim()
        if (ans) currentAnswer = ans
        expectAnswer = true
        continue
      }

      if (bracketMatch && currentQuestion) {
        currentOptions = bracketMatch[1].split(/[\/,]/).map((o) => o.trim()).filter(Boolean)
        continue
      }

      if (expectAnswer && currentQuestion) {
        currentAnswer += trimmed + ' '
        continue
      }

      if (!hasSeenNumbered && !currentQuestion && results.length === 0) {
        passageLines.push(trimmed)
        continue
      }

      if (currentQuestion && !expectAnswer) {
        currentQuestion += ' ' + trimmed
      }
    }

    flush()
    return results.filter((q) => q.question_text.trim())
  }

  // ─── MCQ / Nearest Meaning parser ───
  const parseMcqText = (text: string): Array<{ question_text: string; answer: string; options: string[] }> => {
    const normalized = cleanFormatting(text)
    const results: Array<{ question_text: string; answer: string; options: string[] }> = []
    const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean)
    let currentQ = ''
    let currentOptions: string[] = []
    let currentAnswer = ''
    let state: 'search' | 'question' | 'options' | 'answer' = 'search'

    const flush = () => {
      if (currentQ.trim() && currentOptions.length > 0) {
        let cleanAnswer = currentAnswer.trim()
        const letterMatch = cleanAnswer.match(/^([A-Da-d])[\)\.\s]+(.*)/) 
        if (letterMatch) {
          const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65
          cleanAnswer = idx < currentOptions.length ? currentOptions[idx] : letterMatch[2] || cleanAnswer
        }
        results.push({ question_text: currentQ.trim(), answer: cleanAnswer || 'Answer not provided', options: currentOptions })
      }
      currentQ = ''
      currentOptions = []
      currentAnswer = ''
      state = 'search'
    }

    for (const line of lines) {
      const qInline = line.match(/^(?:Question)\s*[:\-–—]\s*(.+)$/i)
      const qHeader = /^(?:Question)\s*[:\-–—.\s]*$/i.test(line)
      const numMatch = line.match(/^(\d+)[\.)]\s+(.*)/)
      const optMatch = line.match(/^([A-Da-d])[\)\.\s]+(.+)/)
      const ansMatch = line.match(/^(?:Answer|Ans)\s*[:\-–—.\s]*(.*)$/i)
      const optionsHeader = /^Options?\s*[:\-–—.\s]*$/i.test(line)

      if (qInline) { flush(); currentQ = qInline[1].trim(); state = 'question'; continue }
      if (qHeader) { flush(); state = 'question'; continue }
      if (numMatch && state !== 'options') { flush(); currentQ = numMatch[2].trim(); state = 'question'; continue }
      if (optionsHeader) { state = 'options'; continue }
      if (optMatch) { currentOptions.push(optMatch[2].trim()); state = 'options'; continue }
      if (ansMatch) { currentAnswer = ansMatch[1]?.trim() || ''; state = 'answer'; continue }
      if (state === 'question') { currentQ += ' ' + line; continue }
      if (state === 'answer') { currentAnswer += ' ' + line; continue }
    }

    flush()
    return results.filter((q) => q.question_text.trim())
  }

  // ─── Do as Directed parser (Change tense/voice/person/number/gender) ───
  const parseDoAsDirectedText = (text: string): Array<{ question_text: string; answer: string }> => {
    const normalized = cleanFormatting(text)
    const results: Array<{ question_text: string; answer: string }> = []
    const lines = normalized.split('\n')
    let currentQuestion = ''
    let currentAnswer = ''
    let currentHeading = ''
    let state: 'search' | 'question' | 'answer' = 'search'

    const flush = () => {
      if (currentQuestion.trim() && currentAnswer.trim()) {
        const fullQuestion = currentHeading ? `${currentHeading}\n\n${currentQuestion.trim()}` : currentQuestion.trim()
        results.push({ question_text: fullQuestion, answer: currentAnswer.trim() })
      }
      currentQuestion = ''
      currentAnswer = ''
      state = 'search'
    }

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const headingMatch = trimmed.match(/^\d+[\.)]\s*(Change\s+the\s+\w+.*)$/i)
      if (headingMatch) { flush(); currentHeading = headingMatch[1].trim(); state = 'search'; continue }

      const qHeader = /^Question\s*[:\-–—.\s]*$/i.test(trimmed)
      const qInline = trimmed.match(/^Question\s*[:\-–—]\s*(.+)$/i)
      const aHeader = /^Answer\s*[:\-–—.\s]*$/i.test(trimmed)
      const aInline = trimmed.match(/^Answer\s*[:\-–—]\s*(.+)$/i)

      if (qHeader) { if (currentQuestion && currentAnswer) flush(); state = 'question'; continue }
      if (qInline) { if (currentQuestion && currentAnswer) flush(); currentQuestion = qInline[1].trim(); state = 'question'; continue }
      if (aHeader) { state = 'answer'; continue }
      if (aInline) { currentAnswer = aInline[1].trim(); state = 'answer'; continue }

      if (state === 'question') { currentQuestion += (currentQuestion ? '\n' : '') + trimmed; continue }
      if (state === 'answer') { currentAnswer += (currentAnswer ? '\n' : '') + trimmed; continue }

      const numMatch = trimmed.match(/^\d+[\.)]\s+(.*)/)
      if (numMatch) { flush(); currentHeading = numMatch[1].trim(); continue }
    }

    flush()

    // Fallback: split on double blank lines and pair them
    if (results.length === 0) {
      const blocks = normalized.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
      for (let i = 0; i < blocks.length - 1; i += 2) {
        results.push({ question_text: blocks[i], answer: blocks[i + 1] || 'Answer not provided' })
      }
    }

    return results.filter((q) => q.question_text.trim())
  }

  // ─── Long response parser (Essay, Email, Report, etc.) ───
  const parseLongResponseText = (text: string): Array<{ question_text: string; answer: string }> => {
    const normalized = cleanFormatting(text)
    const results: Array<{ question_text: string; answer: string }> = []
    const lines = normalized.split('\n')
    let currentQuestion = ''
    let currentAnswer = ''
    let state: 'search' | 'question' | 'answer' = 'search'

    const flush = () => {
      if (currentQuestion.trim()) {
        results.push({ question_text: currentQuestion.trim(), answer: currentAnswer.trim() || 'Answer not provided' })
      }
      currentQuestion = ''
      currentAnswer = ''
      state = 'search'
    }

    for (const line of lines) {
      const trimmed = line.trim()
      const qHeader = /^Question\s*[:\-–—.\s]*$/i.test(trimmed)
      const qInline = trimmed.match(/^Question\s*[:\-–—]\s*(.+)$/i)
      const aHeader = /^Answer\s*[:\-–—.\s]*$/i.test(trimmed)
      const aInline = trimmed.match(/^Answer\s*[:\-–—]\s*(.+)$/i)
      const numMatch = trimmed.match(/^(\d+)[\.)]\s+(.*)/)

      if (qHeader) { if (currentQuestion && currentAnswer) flush(); state = 'question'; continue }
      if (qInline) { if (currentQuestion && currentAnswer) flush(); currentQuestion = qInline[1].trim(); state = 'question'; continue }
      if (aHeader) { state = 'answer'; continue }
      if (aInline) { currentAnswer = aInline[1].trim(); state = 'answer'; continue }
      if (numMatch && state !== 'answer') { flush(); currentQuestion = numMatch[2].trim(); state = 'question'; continue }
      if (!trimmed) { if (state === 'answer') currentAnswer += '\n'; continue }
      if (state === 'question') { currentQuestion += '\n' + trimmed; continue }
      if (state === 'answer') { currentAnswer += (currentAnswer ? '\n' : '') + trimmed; continue }
    }

    flush()
    return results.filter((q) => q.question_text.trim())
  }

  // ─── Instruction-aware router ───
  const PASSAGE_TYPES = ['Paragraph base question(Textbook)', 'Stanza Base Question(Poem) – 2mark', 'Stanza Base Question(Poem) – 3mark', 'Paragraph base question(Dolphin) 4 mark', 'Paragraph base question(Dolphin) – 5 mark']
  const TRUE_FALSE_TYPES_LIST = ['True or False']
  const FILL_BLANKS_TYPES_LIST = ['Fill in the blanks (Textbook) 3 mark', 'Fill in the blanks (Textbook) 4 mark', 'Fill in the blanks (Textbook) 5 mark']
  const MCQ_TYPES_LIST = ['Opposite meaning', 'Frame the questions']
  const DO_AS_DIRECTED_LIST = ['Change the person', 'Change the number', 'Change the gender', 'Change the tense', 'Change the Voice']
  const LONG_RESPONSE_LIST = ['Essay', 'Email', 'Report', 'Picture description', 'Short Note']

  const parseQuestionsFromText = (text: string, instructionType?: string): Array<{ question_text: string; answer: string; options?: string[] }> => {
    const iType = instructionType || selectedInstruction
    if (PASSAGE_TYPES.includes(iType)) return parsePassageText(text)
    if (TRUE_FALSE_TYPES_LIST.includes(iType)) return parseTrueFalseText(text)
    if (FILL_BLANKS_TYPES_LIST.includes(iType)) return parseFillBlanksText(text)
    if (MCQ_TYPES_LIST.includes(iType)) return parseMcqText(text)
    if (DO_AS_DIRECTED_LIST.includes(iType)) return parseDoAsDirectedText(text)
    if (LONG_RESPONSE_LIST.includes(iType)) return parseLongResponseText(text)
    // Fallback: try passage first, then generic
    const passageResult = parsePassageText(text)
    if (passageResult.length > 0) return passageResult
    const mcqResult = parseMcqText(text)
    if (mcqResult.length > 0) return mcqResult
    return parseDoAsDirectedText(text)
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

  const parseFileQuestions = async (file: File): Promise<{
    flat: Array<{ question_text: string; answer: string; options?: string[] }>
    groups: Array<{ passage: string; questions: Array<{ question: string; answer: string }> }>
  }> => {
    const fileName = file.name.toLowerCase()

    // For .txt files, use the client-side parser directly
    if (fileName.endsWith('.txt')) {
      const text = await file.text()
      if (isPassageInstruction) {
        const groups = parsePassageGroups(text)
        const flat = groups.flatMap(g =>
          g.questions.map(q => ({
            question_text: `${g.passage}\n\n${q.question}`,
            answer: q.answer,
          }))
        )
        return { flat, groups }
      }
      const flat = parseToFlatQuestions(text)
      return { flat, groups: [] }
    }

    // For .docx/.pdf, call the API
    const formData = new FormData()
    formData.append('file', file)
    formData.append('instruction_type', selectedInstruction)

    const response = await fetch('/api/parse-doc', {
      method: 'POST',
      body: formData,
    })

    let data: any = null
    try {
      data = await response.json()
    } catch {
      throw new Error(`Unable to parse document response (status ${response.status})`)
    }

    if (!response.ok) {
      if (data?.rawText) {
        // Fallback: try client-side parser on extracted text
        const fallbackGroups = parsePassageGroups(data.rawText)
        const fallbackFlat = fallbackGroups.flatMap(g =>
          g.questions.map(q => ({
            question_text: `${g.passage}\n\n${q.question}`,
            answer: q.answer,
          }))
        )
        if (fallbackFlat.length > 0) return { flat: fallbackFlat, groups: fallbackGroups }

        const snippet = data.rawText.substring(0, 300)
        throw new Error(
          `Could not parse questions. Extracted text preview:\n\n"${snippet}..."\n\nEnsure questions are numbered (1. 2. 3.) and answers are marked with "Answer:".`
        )
      }
      throw new Error(data?.error || `Unable to parse document (${response.status})`)
    }

    if (data?.error) throw new Error(data.error)

    return {
      flat: data.questions || [],
      groups: data.groups || [],
    }
  }

  const handleBulkFileUpload = async (file: File) => {
    setUploadMessage('')
    setUploadLoading(true)
    setUploadStatus('parsing')
    setPreviewQuestions([])
    setPreviewGroups([])

    try {
      if (!selectedStandard || !selectedInstruction || (hasUnits && !selectedUnit)) {
        setUploadMessage('Please select standard, instruction type, and unit (if required) before uploading.')
        setUploadStatus('error')
        return
      }

      const supportedFormats = ['.txt', '.pdf', '.docx', '.doc']
      const isSupported = supportedFormats.some((ext) => file.name.toLowerCase().endsWith(ext))
      if (!isSupported) {
        setUploadMessage('Supported upload formats are .txt, .pdf, .docx, and .doc.')
        setUploadStatus('error')
        return
      }

      setUploadFileName(file.name)
      setUploadMessage(`Parsing "${file.name}"...`)

      const { flat, groups } = await parseFileQuestions(file)

      if (flat.length === 0) {
        setUploadMessage('No questions could be parsed. Check the format matches the expected format for this instruction type.')
        setUploadStatus('error')
        return
      }

      // Deduplicate flat list before showing in preview
      const seenKeys = new Set<string>()
      const dedupedFlat = flat.filter(item => {
        const parts = item.question_text.split(/\n\n/)
        const q = parts.length > 1 ? parts[parts.length - 1] : item.question_text
        const key = q.trim().toLowerCase().replace(/\s+/g, ' ')
        if (seenKeys.has(key)) {
          console.log('DUPLICATE_REMOVED from preview:', key.substring(0, 60))
          return false
        }
        // Also reject malformed: question contains answer separator AND answer is empty
        if (/(?:Answer|Ans|ANSWER|ANS|answer|ans)\s*[:\-–—]/.test(q) &&
            (!item.answer || item.answer === 'Answer not provided')) {
          console.log('MALFORMED_REMOVED from preview:', key.substring(0, 60))
          return false
        }
        seenKeys.add(key)
        console.log('PREVIEW_RECORD', JSON.stringify({ q: q.substring(0, 60), a: item.answer?.substring(0, 60) }))
        return true
      })

      setPreviewQuestions(dedupedFlat)
      setPreviewGroups(groups)

      const groupSummary = groups.length > 0
        ? groups.map((g, i) => `Passage ${i + 1}: ${g.questions.length} question(s)`).join(' · ')
        : ''

      setUploadMessage(
        `Found ${dedupedFlat.length} question(s)${groups.length > 1 ? ` across ${groups.length} passages` : ''}. ${groupSummary ? `(${groupSummary})` : ''} Review below and click "Confirm & Insert" to save.`
      )
      setUploadStatus('preview')
    } catch (caughtError: any) {
      const message = caughtError instanceof Error ? caughtError.message : JSON.stringify(caughtError)
      console.error('Bulk upload parse error:', message, caughtError)
      setUploadMessage(message || 'An error occurred while parsing the file.')
      setUploadStatus('error')
    } finally {
      setUploadLoading(false)
    }
  }

  const insertPreviewQuestions = async () => {
    if (previewQuestions.length === 0) return
    setUploadLoading(true)
    setUploadStatus('inserting')
    setUploadMessage(`Inserting ${previewQuestions.length} questions into database...`)

    try {
      let ensuredUnit: { id: string | null; name: string } | null = null
      if (hasUnits && selectedUnit) {
        ensuredUnit = await ensureQuestionUnit(selectedUnit)
        if (!ensuredUnit?.id) {
          setUploadMessage('Unable to resolve or create unit for upload. Please check unit selection.')
          setUploadStatus('error')
          return
        }
      }

      const standardValue = selectedStandard?.grade_number?.toString() || selectedStandard?.name || ''
      const isTrueFalse = selectedInstruction === 'True or False'

      // ── Repair & deduplicate before building DB payload ─────────────────
      // Convert previewQuestions into ParsedQuestion shape, repair, dedupe,
      // then re-build the flat list for insertion.
      const repairedItems = (() => {
        // Build ParsedQuestion[] from previewQuestions
        // question_text has format "passage\n\nquestion" for passage types
        const parsed = previewQuestions.map(item => {
          const parts = item.question_text.split(/\n\n/)
          const question = parts.length > 1 ? parts[parts.length - 1] : item.question_text
          return { question, answer: item.answer || 'Answer not provided' }
        })

        // Run dedup + repair
        const repaired = validateAndRepair(parsed)

        // Map back to full item shape using original passages
        return repaired.map(r => {
          const original = previewQuestions.find(item => {
            const parts = item.question_text.split(/\n\n/)
            const q = parts.length > 1 ? parts[parts.length - 1] : item.question_text
            return q.trim().toLowerCase() === r.question.trim().toLowerCase()
          })
          return {
            question_text: original?.question_text || r.question,
            answer: r.answer,
            options: original?.options,
          }
        })
      })()

      console.log('DB_PAYLOAD (after repair+dedup) — records:', repairedItems.length)
      repairedItems.forEach((item, i) => {
        console.log(`  PREVIEW_RECORD ${i + 1}:`, JSON.stringify({
          question_text: item.question_text?.substring(0, 100),
          answer: item.answer,
        }))
      })

      const insertPayload = repairedItems.map((item) => ({
        standard: standardValue,
        instruction_type: selectedInstruction,
        unit_id: hasUnits && selectedUnit ? ensuredUnit?.id : null,
        unit_name: hasUnits && selectedUnit ? ensuredUnit?.name : null,
        question_text: item.question_text,
        answer: item.answer,
        marks: parseInt(marks) || 1,
        difficulty,
        options: item.options && item.options.length > 0 ? item.options : isTrueFalse ? ['True', 'False'] : [],
        created_at: new Date().toISOString(),
      }))

      // ── STEP 5: Log exact objects before DB insert ──────────────────────
      console.log('\n' + '─'.repeat(60))
      console.log('[STEP 5] BEFORE DATABASE INSERT — full payload')
      insertPayload.forEach((record, i) => {
        console.log(`\n  Record ${i + 1}:`)
        console.log(JSON.stringify({
          question_text: record.question_text,
          answer: record.answer,
          standard: record.standard,
          instruction_type: record.instruction_type,
          unit_name: record.unit_name,
          marks: record.marks,
          difficulty: record.difficulty,
        }, null, 2))
        if (!record.answer || record.answer === 'Answer not provided') {
          console.warn(`  ⚠️  Record ${i + 1} has NULL/empty answer — BUG DETECTED AT STEP 5`)
        }
      })
      console.log('─'.repeat(60))

      // Insert in batches of 50 to avoid timeouts
      const BATCH_SIZE = 50
      let insertedCount = 0
      for (let i = 0; i < insertPayload.length; i += BATCH_SIZE) {
        const batch = insertPayload.slice(i, i + BATCH_SIZE)

        // ── STEP 6: Log exact payload sent to Supabase ──────────────────
        console.log('\n' + '─'.repeat(60))
        console.log(`[STEP 6] SUPABASE INSERT — batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`)
        batch.forEach((rec, bi) => {
          console.log(`  Batch item ${bi + 1}: question="${rec.question_text?.substring(0, 80)}..."  answer="${rec.answer?.substring(0, 80)}"`)
        })
        console.log('─'.repeat(60))

        const { data: insertedData, error } = await supabase
          .from('questions')
          .insert(batch)
          .select('id, question_text, answer')

        if (error) {
          const message = error.message || error.details || error.hint || 'Failed to upload questions from file.'
          console.error('[STEP 6] Supabase insert error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
          setUploadMessage(`Error after inserting ${insertedCount} questions: ${message}`)
          setUploadStatus('error')
          return
        }

        // ── STEP 7: Query inserted records and verify ────────────────────
        console.log('\n' + '─'.repeat(60))
        console.log(`[STEP 7] AFTER INSERT — queried back ${insertedData?.length ?? 0} records`)
        if (insertedData && insertedData.length > 0) {
          insertedData.forEach((rec: any, ri: number) => {
            console.log(`\n  Inserted record ${ri + 1}:`)
            console.log(`    id           : ${rec.id}`)
            console.log(`    question_text: ${rec.question_text?.substring(0, 100)}`)
            console.log(`    answer       : ${rec.answer}`)
            if (!rec.answer || rec.answer === 'Answer not provided') {
              console.warn(`  ⚠️  Record ${ri + 1} (id=${rec.id}) has NULL/empty answer in DB — BUG CONFIRMED AT STEP 7`)
            }
          })

          // STEP 7b: Re-query by IDs to double-check what Supabase actually stored
          const ids = insertedData.map((r: any) => r.id)
          const { data: verifyData, error: verifyError } = await supabase
            .from('questions')
            .select('id, question_text, answer')
            .in('id', ids)

          if (!verifyError && verifyData) {
            console.log(`\n[STEP 7b] RE-QUERY verification (SELECT question_text, answer FROM questions WHERE id IN ...)`)
            verifyData.forEach((rec: any, ri: number) => {
              console.log(`  Row ${ri + 1}: answer="${rec.answer}"`)
              if (!rec.answer) {
                console.warn(`  ⚠️  Row ${ri + 1} answer is NULL in DB after re-query — column may be wrong or RLS stripping it`)
              }
            })
          }
        }
        console.log('─'.repeat(60))

        insertedCount += batch.length
        setUploadMessage(`Inserted ${insertedCount} of ${insertPayload.length} questions...`)
      }

      await fetchQuestions()
      setUploadMessage(`Successfully uploaded ${insertPayload.length} questions!`)
      setUploadStatus('done')
      setPreviewQuestions([])
    } catch (caughtError: any) {
      const message = caughtError instanceof Error ? caughtError.message : JSON.stringify(caughtError)
      console.error('Bulk insert error:', message, caughtError)
      setUploadMessage(message || 'An error occurred while inserting questions.')
      setUploadStatus('error')
    } finally {
      setUploadLoading(false)
    }
  }

  const cancelPreview = () => {
    setPreviewQuestions([])
    setPreviewGroups([])
    setUploadStatus('idle')
    setUploadMessage('')
    setUploadFileName('')
  }

  const getFormatExample = (): { title: string; example: string } => {
    if (PASSAGE_INSTRUCTION_TYPES.includes(selectedInstruction)) {
      return {
        title: 'Paragraph / Passage format',
        example: `He said to himself, "These deer are really wonderful..."\n\n1. What problem did Edie face in catching deer?\nAnswer: Edie found it difficult because he had to run a lot.\n\n2. How did the cheetah catch the deer?\nAnswer: The cheetah crawled silently and then leapt.`,
      }
    }
    if (selectedInstruction === 'True or False') {
      return {
        title: 'True or False format',
        example: `1. Edie was a Zulu hunter. __________\nTrue\n\n2. The cheetah was unable to catch the deer.\nFalse`,
      }
    }
    if (FILL_IN_THE_BLANKS_INSTRUCTIONS.includes(selectedInstruction)) {
      return {
        title: 'Fill in the blanks format',
        example: `1. Edie saw a large herd of deer grazing in the ______________ green meadow.\n(lush / dry / small)\nAnswer: lush`,
      }
    }
    if (selectedInstruction === 'Opposite meaning' || selectedInstruction === 'Frame the questions') {
      return {
        title: 'MCQ / Multiple choice format',
        example: `Question:\nChoose the nearest meaning of the word "Nearest".\nOptions:\nA) Farthest\nB) Closest\nC) Largest\nD) Smallest\nAnswer: B) Closest`,
      }
    }
    if (DO_AS_DIRECTED_INSTRUCTIONS.includes(selectedInstruction)) {
      return {
        title: 'Do as directed format (Change tense / voice / person / number / gender)',
        example: `1. Change the Tense (Present → Past)\nQuestion\nRohan studies in Class 8. He goes to school every day.\nAnswer\nRohan studied in Class 8. He went to school every day.`,
      }
    }
    if (LONG_RESPONSE_INSTRUCTIONS.includes(selectedInstruction)) {
      return {
        title: `${selectedInstruction} format`,
        example: `Question: Write an essay on importance of education.\nAnswer:\nEducation is the foundation of a successful life...`,
      }
    }
    return {
      title: 'Question and Answer format',
      example: `1. What is the question?\nAnswer: This is the answer.`,
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
    if (!selectedStandard) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name, unit_number')
        .eq('standard_id', selectedStandard.id)
        .order('unit_number', { ascending: true })

      if (error) throw error
      const mappedUnits = (data || []).map((unit: any) => ({
        id: unit.id,
        name: unit.name,
        unit_number: unit.unit_number,
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
        const unitObj = units.find((u) => u.id === selectedUnit)
        if (unitObj) {
          const { data: quData } = await supabase
            .from('question_units')
            .select('id')
            .eq('standard', standardValue)
            .eq('instruction_type', selectedInstruction)
            .eq('unit_name', unitObj.name)
            .maybeSingle()

          if (quData) {
            query = query.eq('unit_id', quData.id)
          } else {
            // No matching question_units entry, so no questions exist yet
            setQuestions([])
            setLoading(false)
            return
          }
        }
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

  // ── Bulk selection helpers ──────────────────────────────────
  const allIds = questions.map(q => q.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id))
  const someSelected = selectedIds.size > 0

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allIds))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} selected question${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return

    setBulkDeleting(true)
    try {
      const ids = Array.from(selectedIds)
      const { error } = await supabase.from('questions').delete().in('id', ids)
      if (error) throw error
      setQuestions(prev => prev.filter(q => !selectedIds.has(q.id)))
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('Failed to delete selected questions')
    } finally {
      setBulkDeleting(false)
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
                            {unit.unit_number ? `${unit.unit_number}. ` : ''}{unit.name}
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
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Bulk Upload Questions</h3>
                          <p className="text-xs text-muted-foreground">Upload .txt, .docx, .doc, or .pdf files — formatting characters (*, #, **) are auto-stripped</p>
                        </div>
                      </div>

                      {/* Format-specific example */}
                      {(() => {
                        const fmt = getFormatExample()
                        return (
                          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 border border-slate-200 text-sm text-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <p className="font-semibold">{fmt.title}</p>
                            </div>
                            <pre className="whitespace-pre-wrap text-xs leading-5 bg-white/70 rounded-lg p-3 border border-slate-100">{fmt.example}</pre>
                          </div>
                        )
                      })()}

                      {/* File input */}
                      {uploadStatus !== 'preview' && uploadStatus !== 'inserting' && (
                        <div className="flex items-center gap-3">
                          <Input
                            type="file"
                            accept=".txt,.pdf,.docx,.doc"
                            onChange={handleFileInputChange}
                            className="cursor-pointer flex-1"
                            disabled={uploadLoading}
                          />
                          {uploadLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                        </div>
                      )}

                      {/* Status message */}
                      {uploadMessage && (
                        <div className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-3 ${
                          uploadStatus === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                          uploadStatus === 'done' ? 'bg-green-50 border-green-200 text-green-800' :
                          uploadStatus === 'preview' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                          uploadStatus === 'inserting' || uploadStatus === 'parsing' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                          'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                          {uploadStatus === 'error' && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                          {uploadStatus === 'done' && <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                          {uploadStatus === 'preview' && <Eye className="h-4 w-4 mt-0.5 shrink-0" />}
                          {(uploadStatus === 'inserting' || uploadStatus === 'parsing') && <Loader2 className="h-4 w-4 mt-0.5 shrink-0 animate-spin" />}
                          <span>{uploadMessage}</span>
                        </div>
                      )}

                      {/* Preview Panel */}
                      {uploadStatus === 'preview' && previewQuestions.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-blue-600" />
                              <p className="text-sm font-semibold">
                                Preview — {previewQuestions.length} question(s)
                                {previewGroups.length > 1 && ` across ${previewGroups.length} passages`}
                                {' '}from &quot;{uploadFileName}&quot;
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={cancelPreview} disabled={uploadLoading}>
                                <X className="h-3.5 w-3.5 mr-1" /> Cancel
                              </Button>
                              <Button size="sm" onClick={insertPreviewQuestions} disabled={uploadLoading} className="bg-green-600 hover:bg-green-700 text-white">
                                {uploadLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                                Confirm & Insert ({previewQuestions.length})
                              </Button>
                            </div>
                          </div>

                          <div className="max-h-[600px] overflow-y-auto space-y-4 rounded-xl border border-slate-200 p-3 bg-white">
                            {/* Grouped view for passage instructions */}
                            {previewGroups.length > 0 ? (
                              previewGroups.map((group, gi) => (
                                <div key={gi} className="rounded-lg border border-blue-100 overflow-hidden">
                                  {/* Passage header */}
                                  <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                                      Passage {gi + 1}
                                    </span>
                                    <span className="text-xs text-blue-600">
                                      {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  {/* Passage text */}
                                  <div className="px-4 py-3 bg-blue-50/40 border-b border-blue-100">
                                    <p className="text-sm text-slate-700 leading-relaxed">{group.passage}</p>
                                  </div>
                                  {/* Questions */}
                                  <div className="divide-y divide-slate-100">
                                    {group.questions.map((q, qi) => (
                                      <div key={qi} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-2 mb-1.5">
                                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded shrink-0 mt-0.5">
                                            Q{qi + 1}
                                          </span>
                                          <p className="text-sm font-medium">{q.question}</p>
                                        </div>
                                        <div className="flex items-start gap-2 ml-8">
                                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded shrink-0 mt-0.5">A</span>
                                          <p className="text-sm text-slate-600">{q.answer}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              /* Flat view for non-passage instructions */
                              previewQuestions.map((pq, idx) => (
                                <div key={idx} className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                  <div className="flex items-start gap-2 mb-2">
                                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded shrink-0 mt-0.5">Q{idx + 1}</span>
                                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{pq.question_text}</p>
                                  </div>
                                  <div className="flex items-start gap-2 ml-8">
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded shrink-0 mt-0.5">A</span>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{pq.answer}</p>
                                  </div>
                                  {pq.options && pq.options.length > 0 && (
                                    <div className="ml-8 mt-1">
                                      <span className="text-xs text-muted-foreground">Options: {pq.options.join(' | ')}</span>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* Done state — upload more */}
                      {uploadStatus === 'done' && (
                        <Button variant="outline" size="sm" onClick={cancelPreview}>
                          <Upload className="h-3.5 w-3.5 mr-1" /> Upload Another File
                        </Button>
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

                        {/* ── Bulk-action toolbar ── */}
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
                          {/* Select-all checkbox */}
                          <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {allSelected ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : someSelected ? (
                              <div className="h-4 w-4 rounded border-2 border-primary bg-primary/20 flex items-center justify-center">
                                <div className="h-1.5 w-2.5 bg-primary rounded-sm" />
                              </div>
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>

                          <div className="flex items-center gap-3">
                            {someSelected && (
                              <span className="text-xs text-muted-foreground">
                                {selectedIds.size} of {questions.length} selected
                              </span>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={!someSelected || bulkDeleting}
                              onClick={handleBulkDelete}
                              className="gap-1.5"
                            >
                              {bulkDeleting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              {bulkDeleting
                                ? 'Deleting…'
                                : someSelected
                                ? `Delete (${selectedIds.size})`
                                : 'Delete Selected'}
                            </Button>
                          </div>
                        </div>

                        {/* ── Question cards ── */}
                        {isPassageInstruction ? (
                          groupPassageQuestions(questions).map((group, groupIndex) => (
                            <div key={`group-${groupIndex}`} className="border rounded-lg p-4 hover:bg-accent/5 transition">
                              <div className="mb-4">
                                <p className="text-sm font-semibold mb-2">Passage</p>
                                <p className="whitespace-pre-wrap text-sm text-slate-800">{group.passage}</p>
                              </div>
                              <div className="space-y-4">
                                {group.items.map((q, idx) => (
                                  <div
                                    key={q.id}
                                    className={`rounded-lg border p-4 bg-white transition ${
                                      selectedIds.has(q.id) ? 'border-primary ring-1 ring-primary' : 'border-slate-200'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                      <div className="flex items-center gap-2">
                                        {/* Checkbox */}
                                        <button
                                          type="button"
                                          onClick={() => toggleSelectOne(q.id)}
                                          className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                          {selectedIds.has(q.id)
                                            ? <CheckSquare className="h-4 w-4 text-primary" />
                                            : <Square className="h-4 w-4" />}
                                        </button>
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
                            <div
                              key={q.id}
                              className={`border rounded-lg p-4 hover:bg-accent/5 transition ${
                                selectedIds.has(q.id) ? 'border-primary ring-1 ring-primary bg-primary/5' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  {/* Checkbox */}
                                  <button
                                    type="button"
                                    onClick={() => toggleSelectOne(q.id)}
                                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    {selectedIds.has(q.id)
                                      ? <CheckSquare className="h-4 w-4 text-primary" />
                                      : <Square className="h-4 w-4" />}
                                  </button>
                                  <div className="flex-1 min-w-0">
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
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
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
