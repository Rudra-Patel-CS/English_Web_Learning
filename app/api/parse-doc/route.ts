import { NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { parsePassageGroups, parseToFlatQuestions } from '@/lib/passage-parser'

const PASSAGE_TYPES = [
  'Paragraph base question(Textbook)',
  'Stanza Base Question(Poem) \u20132mark',
  'Stanza Base Question(Poem) \u20133mark',
  'Paragraph base question(Dolphin) 4 mark',
  'Paragraph base question(Dolphin) \u2013 5 mark',
]

// ─── Debug logger (server-side — visible in terminal) ────────────────────────
function dbg(step: string, label: string, value: unknown) {
  const line = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`[STEP ${step}] ${label}`)
  console.log(line)
  console.log('─'.repeat(60))
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const instructionType = (formData.get('instruction_type') as string | null) || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let rawText = ''
    const fileName = file.name.toLowerCase()

    // ── STEP 1: Raw Mammoth Extraction ───────────────────────────────────────
    if (fileName.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default || require('pdf-parse')
      const data = await pdfParse(buffer)
      rawText = data.text
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      try {
        const result = await mammoth.extractRawText({ buffer })
        rawText = result.value
      } catch (err) {
        console.warn('Mammoth failed, falling back to utf-8', err)
        rawText = buffer.toString('utf-8')
      }
    } else if (fileName.endsWith('.txt')) {
      rawText = buffer.toString('utf-8')
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Use .txt, .docx, .doc, or .pdf' },
        { status: 400 }
      )
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'The uploaded file appears to be empty.' }, { status: 422 })
    }

    dbg('1', 'RAW MAMMOTH EXTRACTION', `RAW DOCX TEXT START\n${rawText}\nRAW DOCX TEXT END`)
    dbg('1', 'File info', `fileName="${fileName}"  chars=${rawText.length}  instruction="${instructionType}"`)

    // ── STEP 2-4: Parse ──────────────────────────────────────────────────────
    if (PASSAGE_TYPES.includes(instructionType)) {
      const groups = parsePassageGroups(rawText)

      // STEP 2: Passage Detection
      groups.forEach((g, i) => {
        dbg('2', `Detected Passage ${i + 1}`, g.passage)
      })

      if (groups.length === 0 || groups.every(g => g.questions.length === 0)) {
        dbg('2', 'ERROR — no groups parsed', { groupCount: groups.length })
        return NextResponse.json(
          {
            error: 'No questions found. Make sure questions are numbered (1. 2. 3.) and answers are marked with "Answer:" or "Ans:".',
            rawText: rawText.substring(0, 600),
          },
          { status: 422 }
        )
      }

      // STEP 3 + 4: Question and Answer Extraction
      groups.forEach((g, gi) => {
        g.questions.forEach((q, qi) => {
          dbg('3', `Passage ${gi + 1} — Original Question Block ${qi + 1}`, q.question)
          dbg('4', `Passage ${gi + 1} — Q${qi + 1} Parsed Question`, q.question)
          dbg('4', `Passage ${gi + 1} — Q${qi + 1} Parsed Answer`, q.answer ?? 'NULL ← BUG HERE')
        })
      })

      const questions = groups.flatMap(group =>
        group.questions.map(q => ({
          question_text: `${group.passage}\n\n${q.question}`,
          answer: q.answer,
        }))
      )

      // STEP 5: Before DB Insert — log exact objects
      dbg('5', 'BEFORE DATABASE INSERT — full question objects', questions)

      return NextResponse.json({ questions, groups })
    }

    // Non-passage types
    const questions = parseToFlatQuestions(rawText)

    groups_log: {
      questions.forEach((q, i) => {
        dbg('3', `Flat Q${i + 1} — Original Block`, q.question_text)
        dbg('4', `Flat Q${i + 1} — Parsed Question`, q.question_text)
        dbg('4', `Flat Q${i + 1} — Parsed Answer`, q.answer ?? 'NULL ← BUG HERE')
      })
      dbg('5', 'BEFORE DATABASE INSERT — flat questions', questions)
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: 'No questions could be extracted. Make sure questions are numbered (1. 2. 3.) and answers are marked with "Answer:" or "Ans:".',
          rawText: rawText.substring(0, 600),
        },
        { status: 422 }
      )
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Doc parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse document. Please check the file format.' },
      { status: 500 }
    )
  }
}
