/**
 * passage-parser.test.ts
 * Unit tests for the passage parser.
 * Run with: npx jest lib/passage-parser.test.ts
 */

import {
  splitInlineAnswer,
  containsAnswerSeparator,
  repairRecord,
  parsePassageGroups,
  validateAndRepair,
  cleanText,
  normalise,
} from './passage-parser'

// ─────────────────────────────────────────────────────────────────────────────
// splitInlineAnswer
// ─────────────────────────────────────────────────────────────────────────────

describe('splitInlineAnswer', () => {
  test('splits question and answer on same line with Answer:', () => {
    const result = splitInlineAnswer(
      'Who was sitting under the tree? Answer: A Zulu hunter named Edie.'
    )
    expect(result.question).toBe('Who was sitting under the tree?')
    expect(result.answer).toBe('A Zulu hunter named Edie.')
  })

  test('splits with Ans:', () => {
    const result = splitInlineAnswer('What did he see? Ans: A herd of deer.')
    expect(result.question).toBe('What did he see?')
    expect(result.answer).toBe('A herd of deer.')
  })

  test('splits with ANSWER:', () => {
    const result = splitInlineAnswer('What is the capital? ANSWER: New Delhi.')
    expect(result.question).toBe('What is the capital?')
    expect(result.answer).toBe('New Delhi.')
  })

  test('splits with ANS:', () => {
    const result = splitInlineAnswer('Who wrote it? ANS: Shakespeare.')
    expect(result.question).toBe('Who wrote it?')
    expect(result.answer).toBe('Shakespeare.')
  })

  test('splits with lowercase answer:', () => {
    const result = splitInlineAnswer('What is water? answer: H2O')
    expect(result.question).toBe('What is water?')
    expect(result.answer).toBe('H2O')
  })

  test('splits with lowercase ans:', () => {
    const result = splitInlineAnswer('What is 2+2? ans: 4')
    expect(result.question).toBe('What is 2+2?')
    expect(result.answer).toBe('4')
  })

  test('returns null answer when no separator present', () => {
    const result = splitInlineAnswer('Who was sitting under the tree?')
    expect(result.question).toBe('Who was sitting under the tree?')
    expect(result.answer).toBeNull()
  })

  test('trims extra whitespace', () => {
    const result = splitInlineAnswer(
      '  Who was Edie?   Answer:   A Zulu hunter.  '
    )
    expect(result.question).toBe('Who was Edie?')
    expect(result.answer).toBe('A Zulu hunter.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// containsAnswerSeparator
// ─────────────────────────────────────────────────────────────────────────────

describe('containsAnswerSeparator', () => {
  test('detects Answer:', () => {
    expect(containsAnswerSeparator('Who was Edie? Answer: A hunter.')).toBe(true)
  })

  test('detects Ans:', () => {
    expect(containsAnswerSeparator('What? Ans: Something.')).toBe(true)
  })

  test('detects ANSWER:', () => {
    expect(containsAnswerSeparator('Question ANSWER: reply')).toBe(true)
  })

  test('returns false for clean question', () => {
    expect(containsAnswerSeparator('Who was sitting under the tree?')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// repairRecord
// ─────────────────────────────────────────────────────────────────────────────

describe('repairRecord', () => {
  test('repairs question that contains Answer:', () => {
    const result = repairRecord(
      'Who was Edie? Answer: A Zulu hunter.',
      null
    )
    expect(result.question).toBe('Who was Edie?')
    expect(result.answer).toBe('A Zulu hunter.')
  })

  test('does not modify clean record', () => {
    const result = repairRecord('Who was Edie?', 'A Zulu hunter.')
    expect(result.question).toBe('Who was Edie?')
    expect(result.answer).toBe('A Zulu hunter.')
  })

  test('uses fallback answer when split answer is empty', () => {
    const result = repairRecord('Who was Edie? Answer: A Zulu hunter.', 'fallback')
    expect(result.answer).toBe('A Zulu hunter.')
  })

  test('uses provided answer when question is clean', () => {
    const result = repairRecord('Who was Edie?', 'A Zulu hunter.')
    expect(result.answer).toBe('A Zulu hunter.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// parsePassageGroups — same line Q+A
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePassageGroups — same line', () => {
  const input = `Long long ago a Zulu hunter was sitting under a tree. His name was Edie.
1. Who was sitting under the tree? Answer: A Zulu hunter named Edie was sitting under the tree.
2. What did Edie see in the meadow? Answer: Edie saw a large herd of deer grazing in the lush green meadow.`

  test('produces one passage group', () => {
    const groups = parsePassageGroups(input)
    expect(groups).toHaveLength(1)
  })

  test('passage text is correct', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].passage).toContain('Long long ago a Zulu hunter')
  })

  test('produces 2 questions', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions).toHaveLength(2)
  })

  test('Q1 question is correct', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions[0].question).toBe('Who was sitting under the tree?')
  })

  test('Q1 answer is correct', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions[0].answer).toBe(
      'A Zulu hunter named Edie was sitting under the tree.'
    )
  })

  test('Q2 question is correct', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions[1].question).toBe('What did Edie see in the meadow?')
  })

  test('Q2 answer is correct', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions[1].answer).toBe(
      'Edie saw a large herd of deer grazing in the lush green meadow.'
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// parsePassageGroups — multiline Q+A
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePassageGroups — multiline', () => {
  const input = `Long long ago a Zulu hunter was sitting under a tree.
1. Who was sitting under the tree?
Answer: A Zulu hunter named Edie was sitting under the tree.
2. What did Edie see?
Ans: He saw a herd of deer.`

  test('produces 2 questions', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions).toHaveLength(2)
  })

  test('Q1 answer extracted from next line', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions[0].answer).toBe(
      'A Zulu hunter named Edie was sitting under the tree.'
    )
  })

  test('Q2 answer extracted with Ans:', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions[1].answer).toBe('He saw a herd of deer.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// parsePassageGroups — multiple passages
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePassageGroups — multiple passages', () => {
  const input = `Long long ago a Zulu hunter was sitting under a tree.
1. Who was Edie? Answer: A Zulu hunter.
2. Where was he? Answer: Under a tree.
He said to himself, these deer are wonderful.
1. What did Edie say? Answer: He said the deer are wonderful.
2. What was his wish? Answer: He wished for an easy way to catch deer.`

  test('produces 2 passage groups', () => {
    const groups = parsePassageGroups(input)
    expect(groups).toHaveLength(2)
  })

  test('first passage has 2 questions', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions).toHaveLength(2)
  })

  test('second passage has 2 questions', () => {
    const groups = parsePassageGroups(input)
    expect(groups[1].questions).toHaveLength(2)
  })

  test('second passage text is correct', () => {
    const groups = parsePassageGroups(input)
    expect(groups[1].passage).toContain('He said to himself')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// parsePassageGroups — mixed formatting
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePassageGroups — mixed formatting', () => {
  const input = `Passage text here.
Q1. What is this? Answer: This is a test.
Q.2 What is that? Ans: That is also a test.
Question 3. What about this? ANSWER: This too.`

  test('parses Q1 format', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions[0].question).toBe('What is this?')
    expect(groups[0].questions[0].answer).toBe('This is a test.')
  })

  test('parses Q.2 format', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions[1].question).toBe('What is that?')
    expect(groups[0].questions[1].answer).toBe('That is also a test.')
  })

  test('parses Question 3 format', () => {
    const groups = parsePassageGroups(input)
    expect(groups[0].questions[2].question).toBe('What about this?')
    expect(groups[0].questions[2].answer).toBe('This too.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// validateAndRepair
// ─────────────────────────────────────────────────────────────────────────────

describe('validateAndRepair', () => {
  test('repairs question containing Answer:', () => {
    const input = [
      { question: 'Who was Edie? Answer: A Zulu hunter.', answer: 'Answer not provided' },
    ]
    const result = validateAndRepair(input)
    expect(result[0].question).toBe('Who was Edie?')
    expect(result[0].answer).toBe('A Zulu hunter.')
  })

  test('skips empty questions', () => {
    const input = [
      { question: '', answer: 'some answer' },
      { question: 'Valid question?', answer: 'Valid answer.' },
    ]
    const result = validateAndRepair(input)
    expect(result).toHaveLength(1)
    expect(result[0].question).toBe('Valid question?')
  })

  test('normalises whitespace', () => {
    const input = [
      { question: '  Who  was  Edie?  ', answer: '  A  hunter.  ' },
    ]
    const result = validateAndRepair(input)
    expect(result[0].question).toBe('Who was Edie?')
    expect(result[0].answer).toBe('A hunter.')
  })

  test('does not modify already-clean records', () => {
    const input = [
      { question: 'Who was Edie?', answer: 'A Zulu hunter.' },
    ]
    const result = validateAndRepair(input)
    expect(result[0].question).toBe('Who was Edie?')
    expect(result[0].answer).toBe('A Zulu hunter.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// cleanText
// ─────────────────────────────────────────────────────────────────────────────

describe('cleanText', () => {
  test('removes markdown bold', () => {
    expect(cleanText('**bold text**')).toBe('bold text')
  })

  test('removes markdown headings', () => {
    expect(cleanText('## Heading')).toBe('Heading')
  })

  test('collapses multiple spaces', () => {
    expect(cleanText('too   many   spaces')).toBe('too many spaces')
  })

  test('normalises line endings', () => {
    expect(cleanText('line1\r\nline2')).toBe('line1\nline2')
  })
})
