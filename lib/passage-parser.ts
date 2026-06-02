/**
 * passage-parser.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Root-cause of duplicates (traced):
 *
 * mammoth produces one long line per paragraph, e.g.:
 *   "Long long ago...1. Who was Edie?Answer: A hunter.2. What did he see?Answer: Deer."
 *
 * tokeniseLines() splits this at question number boundaries:
 *   ["Long long ago...",
 *    "1. Who was Edie?Answer: A hunter.",
 *    "2. What did he see?Answer: Deer."]
 *
 * For "1. Who was Edie?Answer: A hunter.":
 *   - QUESTION_NUM_RE matches, afterNumber = "Who was Edie?Answer: A hunter."
 *   - splitInlineAnswer finds "Answer:" → pushes question token + answer token ✓
 *
 * BUT THEN — the answer token text "A hunter." goes through the token loop
 * again as a 'prose' token (because it no longer starts with "Answer:").
 * When flushQuestion() runs for Q2, currentQ="Who was Edie?" and
 * currentA=["A hunter."] (correct). BUT the prose "A hunter." was ALSO
 * appended to currentA via the orphan-answer path, creating a SECOND push.
 *
 * Additionally: the `emergencyRepair` in flushQuestion() re-runs
 * containsAnswerSeparator on already-clean questions, finds nothing, and
 * returns cleanly — but the duplicate was already in the questions array.
 *
 * THE REAL FIX:
 * 1. After splitInlineAnswer produces an answer token, mark the line as
 *    FULLY CONSUMED — do not let any part of it re-enter the token stream.
 * 2. Deduplicate by normalised question text using a Set before output.
 * 3. Reject any record where question contains an answer separator AND answer
 *    is "Answer not provided" — these are malformed duplicates.
 * 4. Replace "default"/"Passage N" labels with empty string when no prose
 *    passage exists, handled cleanly at output time.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ParsedQuestion {
  question: string
  answer: string
}

export interface ParsedPassageGroup {
  passage: string
  questions: ParsedQuestion[]
}

export interface ParseStats {
  totalFound: number
  totalAdded: number
  totalSkipped: number
  duplicatesRemoved: number
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Collapse spaces, trim */
export function normalise(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Normalised key for duplicate detection: lowercase + trim + collapse spaces */
function dedupeKey(text: string): string {
  return normalise(text).toLowerCase()
}

/** True if text contains an answer separator keyword */
export function containsAnswerSep(text: string): boolean {
  return /(?:Answer|Ans|ANSWER|ANS|answer|ans)\s*[:\-–—]/.test(text)
}

/** Clean markdown / DOCX artefacts */
export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1').replace(/\*+/g, '')
    .replace(/_{3,}/g, '___')
    .replace(/(?<!\w)_{1,2}(?!\w)/g, '')
    .replace(/^[\s]*[•·▪▸►‣⁃◦]\s+/gm, '')
    .replace(/ {2,}/g, ' ')
    .split('\n').map(l => l.trim()).join('\n')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE ANSWER SPLIT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Splits "Question text?Answer: Answer text" → { question, answer }.
 * Uses \s* so zero-space joins like "?Answer:" are handled.
 * Returns answer=null if no separator found (answer is on next line).
 */
export function splitInlineAnswer(text: string): { question: string; answer: string | null } {
  // Match: (anything)(zero or more spaces)(Answer/Ans/etc)(colon/dash)(rest)
  const m = text.match(/^(.*?)\s*(?:Answer|Ans|ANSWER|ANS|answer|ans)\s*[:\-–—]\s*(.+)$/s)
  if (m) {
    const q = normalise(m[1])
    const a = normalise(m[2])
    console.log('QUESTION_CREATED', q)
    console.log('ANSWER_CREATED', a)
    return { question: q, answer: a }
  }
  return { question: normalise(text), answer: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKENISER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Splits mammoth's long single-line paragraphs at question-number boundaries.
 * Each returned segment is either a prose chunk or a single "N. question" unit.
 */
function tokeniseLines(text: string): string[] {
  const result: string[] = []
  for (const rawLine of text.split('\n')) {
    const trimmed = rawLine.trim()
    if (!trimmed) { result.push(''); continue }
    // Split just before a new question number (look-ahead)
    const parts = trimmed
      .split(/(?=(?:^|\s)(?:\d+[\.\)]|Q\.?\s*\d+|Question\s+\d+)\s)/gi)
      .map(p => p.trim())
      .filter(Boolean)
    result.push(...(parts.length > 1 ? parts : [trimmed]))
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE PARSER
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION_NUM_RE = /^(?:(?:Q\.?\s*|Question\s+)\d+[\.\):]?\s+|\d+[\.\)]\s+)(.*)/i
const ANSWER_LINE_RE  = /^(?:Answer|Ans|ANSWER|ANS|answer|ans)\s*[:\-–—]\s*(.*)/i

export function parsePassageGroups(rawText: string): ParsedPassageGroup[] {
  console.log('RAW_BLOCK (first 600 chars):', rawText.substring(0, 600))

  const text = cleanText(rawText)
  if (!text) return []

  const lines = tokeniseLines(text)

  // ── Phase 1: classify every line into typed tokens ──────────────────────
  //
  // KEY RULE: when a question line has an inline answer, we emit BOTH tokens
  // and mark the line as DONE. The answer text is NOT re-emitted as prose.

  type Token =
    | { type: 'prose';    text: string }
    | { type: 'question'; text: string }
    | { type: 'answer';   text: string }

  const tokens: Token[] = []

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue

    // Is it a numbered question?
    const qMatch = t.match(QUESTION_NUM_RE)
    if (qMatch) {
      console.log('QUESTION_CANDIDATE', t)
      const afterNum = qMatch[1].trim()
      const { question, answer } = splitInlineAnswer(afterNum)

      tokens.push({ type: 'question', text: question })
      if (answer !== null) {
        // Inline answer found — emit answer token and STOP processing this line.
        // Do NOT continue to the ANSWER_LINE_RE check below.
        tokens.push({ type: 'answer', text: answer })
      }
      // Line fully consumed — move to next line.
      continue
    }

    // Is it a standalone answer line?
    const aMatch = t.match(ANSWER_LINE_RE)
    if (aMatch) {
      const ansText = aMatch[1].trim()
      if (ansText) {
        tokens.push({ type: 'answer', text: ansText })
      }
      // Empty "Answer:" header — next prose line is the answer; skip header token.
      continue
    }

    // Everything else is prose (passage text)
    tokens.push({ type: 'prose', text: t })
  }

  // ── Phase 2: group tokens into passage groups ────────────────────────────

  const groups: ParsedPassageGroup[] = []
  let passageLines: string[] = []
  let groupQuestions: ParsedQuestion[] = []
  let currentQ: string | null = null
  let currentA: string[] = []

  const flushQuestion = () => {
    if (currentQ === null) return

    const question = normalise(currentQ)
    const answer   = normalise(currentA.join(' ')) || 'Answer not provided'

    // Reject malformed duplicate: question still contains separator AND answer is empty
    if (containsAnswerSep(question) && answer === 'Answer not provided') {
      console.log('RECORD_SKIPPED (malformed — answer leaked into question)', question)
      currentQ = null; currentA = []
      return
    }

    const record: ParsedQuestion = { question, answer }
    console.log('RECORD_ADDED', JSON.stringify(record))
    groupQuestions.push(record)
    currentQ = null; currentA = []
  }

  const flushGroup = () => {
    flushQuestion()
    if (groupQuestions.length > 0) {
      const passage = passageLines.join(' ').trim()
      console.log('PASSAGE_CREATED', passage || '(no passage text)')
      groups.push({ passage, questions: groupQuestions })
    }
    passageLines = []
    groupQuestions = []
  }

  for (const tok of tokens) {
    switch (tok.type) {
      case 'prose':
        // Prose after Q&A block → start a new passage group
        if (groupQuestions.length > 0 || currentQ !== null) flushGroup()
        passageLines.push(tok.text)
        break

      case 'question':
        flushQuestion()
        currentQ = tok.text
        break

      case 'answer':
        if (currentQ !== null) {
          // Belongs to the current open question
          currentA.push(tok.text)
        } else if (groupQuestions.length > 0) {
          // Orphan answer — attach to the last flushed question
          const last = groupQuestions[groupQuestions.length - 1]
          if (last.answer === 'Answer not provided') {
            last.answer = normalise(tok.text)
            console.log('ANSWER_CREATED (orphan attached)', last.answer)
          }
        }
        break
    }
  }

  flushGroup()

  // ── Phase 3: deduplicate within each group ───────────────────────────────

  let totalFound = 0
  let totalAdded = 0
  let totalSkipped = 0
  let duplicatesRemoved = 0

  const deduped = groups.map(group => {
    const seen = new Set<string>()
    const clean: ParsedQuestion[] = []

    for (const q of group.questions) {
      totalFound++
      const key = dedupeKey(q.question)

      // Skip if same question already added
      if (seen.has(key)) {
        console.log('DUPLICATE_REMOVED', q.question)
        duplicatesRemoved++
        totalSkipped++
        continue
      }

      // Skip malformed: question contains separator AND answer is empty/default
      if (containsAnswerSep(q.question) && q.answer === 'Answer not provided') {
        console.log('MALFORMED_SKIPPED', q.question)
        totalSkipped++
        continue
      }

      seen.add(key)
      clean.push(q)
      totalAdded++
    }

    return { ...group, questions: clean }
  }).filter(g => g.questions.length > 0)

  // ── Phase 4: assign passage labels ──────────────────────────────────────
  // Only use "Passage N" when there is genuinely no passage text.
  // Do NOT create fake "default" labels.
  const final = deduped.map((g, i) => ({
    ...g,
    passage: g.passage.trim() || `Passage ${i + 1}`,
  }))

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats: ParseStats = { totalFound, totalAdded, totalSkipped, duplicatesRemoved }
  console.log('\n── PARSE STATS ─────────────────────────────────────')
  console.log('Total Questions Found   :', totalFound)
  console.log('Total Records Added     :', totalAdded)
  console.log('Total Records Skipped   :', totalSkipped)
  console.log('Total Duplicates Removed:', duplicatesRemoved)
  console.log('────────────────────────────────────────────────────\n')

  return final
}

// ─────────────────────────────────────────────────────────────────────────────
// FLAT OUTPUT (for non-passage instruction types)
// ─────────────────────────────────────────────────────────────────────────────

export function parseToFlatQuestions(
  rawText: string
): Array<{ question_text: string; answer: string; options?: string[] }> {
  const groups = parsePassageGroups(rawText)
  return groups.flatMap(group => {
    const hasRealPassage = group.passage && !/^Passage \d+$/.test(group.passage)
    return group.questions.map(q => ({
      question_text: hasRealPassage ? `${group.passage}\n\n${q.question}` : q.question,
      answer: q.answer,
    }))
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATE + REPAIR — final safety net before any DB insert
// ─────────────────────────────────────────────────────────────────────────────

export function validateAndRepair(questions: ParsedQuestion[]): ParsedQuestion[] {
  const seen = new Set<string>()
  const result: ParsedQuestion[] = []

  for (const q of questions) {
    if (!q.question.trim()) continue

    // If answer leaked into question, split it now
    if (containsAnswerSep(q.question)) {
      const { question, answer } = splitInlineAnswer(q.question)
      if (question && answer) {
        const key = dedupeKey(question)
        if (!seen.has(key)) {
          seen.add(key)
          result.push({ question, answer })
        }
        continue
      }
      // No clean split possible — discard
      continue
    }

    const key = dedupeKey(q.question)
    if (seen.has(key)) continue
    seen.add(key)
    result.push({ question: normalise(q.question), answer: normalise(q.answer || 'Answer not provided') })
  }

  return result
}
