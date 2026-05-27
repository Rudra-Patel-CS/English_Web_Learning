'use client'

import { NearestMeaningForm, type NearestMeaningData } from './NearestMeaningForm'
import { FillInTheBlanksForm, type FillInTheBlanksData } from './FillInTheBlanksForm'
import { ReadDataForm, type ReadDataFormData } from './ReadDataForm'

interface QuestionFormSelectorProps {
  instructionType: string
  onSubmitNearestMeaning: (data: NearestMeaningData) => void
  onSubmitFillInBlanks: (data: FillInTheBlanksData) => void
  onSubmitReadData: (data: ReadDataFormData) => void
  disabled?: boolean
}

export function QuestionFormSelector({
  instructionType,
  onSubmitNearestMeaning,
  onSubmitFillInBlanks,
  onSubmitReadData,
  disabled
}: QuestionFormSelectorProps) {
  
  // Read the Data instruction type
  if (instructionType === 'Read the Data and answer the question') {
    return (
      <ReadDataForm 
        onSubmit={onSubmitReadData} 
        disabled={disabled}
      />
    )
  }

  // Nearest Meaning instruction types
  if (instructionType === 'Nearest meaning' || instructionType === 'Opposite meaning') {
    return (
      <NearestMeaningForm 
        onSubmit={onSubmitNearestMeaning} 
        disabled={disabled}
      />
    )
  }

  // Fill in the Blanks instruction types
  if (
    instructionType === 'Fill in the blanks (Textbook) 3 mark' ||
    instructionType === 'Fill in the blanks (Textbook) 4 mark' ||
    instructionType === 'Fill in the blanks (Textbook) 5 mark' ||
    instructionType.toLowerCase().includes('fill in the blank')
  ) {
    return (
      <FillInTheBlanksForm 
        onSubmit={onSubmitFillInBlanks} 
        disabled={disabled}
      />
    )
  }

  return null
}

// Helper function to check if instruction type needs custom form
export function needsCustomForm(instructionType: string): boolean {
  const customFormTypes = [
    'Nearest meaning',
    'Opposite meaning',
    'Fill in the blanks (Textbook) 3 mark',
    'Fill in the blanks (Textbook) 4 mark',
    'Fill in the blanks (Textbook) 5 mark',
    'Read the Data and answer the question',
  ]
  
  return customFormTypes.includes(instructionType) || 
         instructionType.toLowerCase().includes('fill in the blank')
}
