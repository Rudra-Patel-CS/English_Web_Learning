import { NextResponse } from 'next/server'
import mammoth from 'mammoth'

function extractQuestions(text: string) {
  const questions = []
  
  // We need a robust parser for the format:
  // 1. Choose the correct sentence:
  // A) She go to school every day.
  // B) She goes to school every day.
  // C) She going to school every day.
  // D) She gone to school every day.
  // Answer: B) She goes to school every day.
  
  // Split text by lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  let currentQ: any = null
  let state = 'search_q' // search_q, options, answer

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Look for question start (e.g., "1.", "1)", "Q1.")
    const qMatch = line.match(/^([Qq]?\d+[\.\)])\s+(.*)/)
    if (qMatch && state !== 'options') { // Found a new question
      if (currentQ) questions.push(currentQ)
      currentQ = {
        question_text: qMatch[2],
        option_a: '', option_b: '', option_c: '', option_d: '',
        correct_option: 'A'
      }
      state = 'options'
      continue
    }

    if (currentQ) {
      // Look for options (A), B), C), D) or a., b., c., d.)
      const optMatch = line.match(/^([A-Da-d])[\.\)]\s+(.*)/)
      if (optMatch) {
        const optLetter = optMatch[1].toUpperCase()
        if (optLetter === 'A') currentQ.option_a = optMatch[2]
        else if (optLetter === 'B') currentQ.option_b = optMatch[2]
        else if (optLetter === 'C') currentQ.option_c = optMatch[2]
        else if (optLetter === 'D') currentQ.option_d = optMatch[2]
        continue
      }
      
      // Look for Answer: A or Answer: A)
      const ansMatch = line.match(/^(?:Answer|Ans)[\s:]*([A-Da-d])/i)
      if (ansMatch) {
        currentQ.correct_option = ansMatch[1].toUpperCase()
        state = 'search_q'
        continue
      }
      
      // If it's none of the above, it might be continuation of previous text
      if (state === 'options') {
        // Find which option was last populated, or if question text needs appending
        if (!currentQ.option_a) currentQ.question_text += '\n' + line
        else if (!currentQ.option_b) currentQ.option_a += ' ' + line
        else if (!currentQ.option_c) currentQ.option_b += ' ' + line
        else if (!currentQ.option_d) currentQ.option_c += ' ' + line
        else currentQ.option_d += ' ' + line
      }
    }
  }
  
  if (currentQ) questions.push(currentQ)
  
  // Filter out incomplete questions
  return questions.filter(q => q.question_text && q.option_a && q.option_b && q.option_c && q.option_d)
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let text = ''

    if (file.name.toLowerCase().endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default || require('pdf-parse');
      const data = await pdfParse(buffer)
      text = data.text
    } else if (file.name.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (file.name.toLowerCase().endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 })
    }

    console.log("EXTRACTED TEXT START:\n", text, "\nEXTRACTED TEXT END");

    const questions = extractQuestions(text)
    console.log("PARSED QUESTIONS:", questions.length)
    return NextResponse.json({ questions })

  } catch (error) {
    console.error('Doc parse error:', error)
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 })
  }
}
