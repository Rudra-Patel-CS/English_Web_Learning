import { NextResponse } from 'next/server'
import mammoth from 'mammoth'

const normalizeText = (text: string) => text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim()
const cleanLine = (line: string) => line.replace(/^\*+|\*+$/g, '').replace(/^\s*-\s*/, '').replace(/\*\*/g, '').trim()

function extractMcqQuestions(text: string) {
  const questions: Array<any> = []
  const lines = normalizeText(text).split('\n').map(l => l.trim()).filter(Boolean)
  let currentQ: any = null
  let state = 'search_q'

  for (const line of lines) {
    const qMatch = line.match(/^([Qq]?\d+[\.\)])\s+(.*)/)
    if (qMatch && state !== 'options') {
      if (currentQ) questions.push(currentQ)
      currentQ = {
        question_text: qMatch[2],
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
      }
      state = 'options'
      continue
    }

    if (!currentQ) continue

    const optMatch = line.match(/^([A-Da-d])[\.\)]\s+(.*)/)
    if (optMatch) {
      const letter = optMatch[1].toUpperCase()
      if (letter === 'A') currentQ.option_a = optMatch[2]
      else if (letter === 'B') currentQ.option_b = optMatch[2]
      else if (letter === 'C') currentQ.option_c = optMatch[2]
      else if (letter === 'D') currentQ.option_d = optMatch[2]
      continue
    }

    const ansMatch = line.match(/^(?:Answer|Ans)[:\s.-]*\s*([A-Da-d])/i)
    if (ansMatch) {
      currentQ.correct_option = ansMatch[1].toUpperCase()
      state = 'search_q'
      continue
    }

    if (state === 'options') {
      if (!currentQ.option_a) currentQ.question_text += '\n' + line
      else if (!currentQ.option_b) currentQ.option_a += ' ' + line
      else if (!currentQ.option_c) currentQ.option_b += ' ' + line
      else if (!currentQ.option_d) currentQ.option_c += ' ' + line
      else currentQ.option_d += ' ' + line
    }
  }

  if (currentQ) questions.push(currentQ)
  return questions.filter(q => q.question_text && q.option_a && q.option_b && q.option_c && q.option_d)
}

function parsePassageQuestions(text: string) {
  const normalized = normalizeText(text)

  const parseSection = (sectionText: string) => {
    const lines = sectionText.split('\n').map(cleanLine).filter(Boolean)
    const passageLines: string[] = []
    const questionBlocks: Array<{ question: string; answer: string }> = []
    let currentQuestion: { question: string; answer: string } | null = null
    let waitingForAnswer = false

    const flushQuestion = () => {
      if (currentQuestion) {
        questionBlocks.push({ question: currentQuestion.question.trim(), answer: currentQuestion.answer.trim() })
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
        currentQuestion = { question: questionMatch[2].trim(), answer: '' }
        waitingForAnswer = false
        continue
      }

      if (answerInlineMatch && currentQuestion) {
        currentQuestion.answer += `${answerInlineMatch[2].trim()} `
        waitingForAnswer = true
        continue
      }

      if (answerHeaderMatch && currentQuestion) {
        waitingForAnswer = true
        continue
      }

      if (waitingForAnswer && currentQuestion) {
        currentQuestion.answer += `${line} `
        continue
      }

      if (currentQuestion && !waitingForAnswer) {
        currentQuestion.question += ` ${line}`
        continue
      }

      passageLines.push(line)
    }

    flushQuestion()
    return { passage: passageLines.join(' '), questionBlocks }
  }

  const sectionRegex = /(?:^|\n)(Paragraph|Stanza|Passage)\s*\d*.*\n([\s\S]*?)(?=(?:\n(?:Paragraph|Stanza|Passage)\s*\d*.*\n)|$)/gim
  const parsedQuestions: Array<{ question_text: string; answer: string }> = []
  let match: RegExpExecArray | null = null
  let foundSection = false

  while ((match = sectionRegex.exec(normalized)) !== null) {
    foundSection = true
    const sectionContent = match[2] || ''
    const { passage, questionBlocks } = parseSection(sectionContent)
    questionBlocks.forEach((block) => {
      const questionText = passage ? `${passage}\n\n${block.question}` : block.question
      parsedQuestions.push({ question_text: questionText, answer: block.answer.trim() })
    })
  }

  if (!foundSection) {
    const { passage, questionBlocks } = parseSection(normalized)
    questionBlocks.forEach((block) => {
      const questionText = passage ? `${passage}\n\n${block.question}` : block.question
      parsedQuestions.push({ question_text: questionText, answer: block.answer.trim() })
    })
  }

  return parsedQuestions.filter(q => q.question_text.trim())
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let text = ''
    const fileName = file.name.toLowerCase()

    if (fileName.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default || require('pdf-parse')
      const data = await pdfParse(buffer)
      text = data.text
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      try {
        const result = await mammoth.extractRawText({ buffer })
        text = result.value
      } catch (error) {
        console.warn('Mammoth parse failed, falling back to plain text for DOC format', error)
        text = buffer.toString('utf-8')
      }
    } else if (fileName.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 })
    }

    const passageQuestions = parsePassageQuestions(text)
    const questions = passageQuestions.length ? passageQuestions : extractMcqQuestions(text)

    if (questions.length === 0) {
      return NextResponse.json({ error: 'Unable to extract questions from this document. Please ensure questions are numbered and answers are included.' }, { status: 422 })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Doc parse error:', error)
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 })
  }
}
