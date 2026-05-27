'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ReadDataFormProps {
  onSubmit: (data: ReadDataFormData) => void
  disabled?: boolean
}

export interface ReadDataFormData {
  imageFile: File | null
  imageUrl?: string
  subQuestions: Array<{
    question: string
    answer: string
  }>
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
}

interface SubQuestion {
  id: string
  question: string
  answer: string
}

export function ReadDataForm({ onSubmit, disabled }: ReadDataFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    { id: 'sq-1', question: '', answer: '' }
  ])
  const [marks, setMarks] = useState('5')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG, PNG, etc.)')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      setImageFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
  }

  const addSubQuestion = () => {
    setSubQuestions([
      ...subQuestions,
      { id: `sq-${Date.now()}`, question: '', answer: '' }
    ])
  }

  const removeSubQuestion = (id: string) => {
    if (subQuestions.length > 1) {
      setSubQuestions(subQuestions.filter(sq => sq.id !== id))
    }
  }

  const updateSubQuestion = (id: string, field: 'question' | 'answer', value: string) => {
    setSubQuestions(subQuestions.map(sq => 
      sq.id === id ? { ...sq, [field]: value } : sq
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile && !imagePreview) {
      alert('Please upload an image/data for students to read')
      return
    }

    const validSubQuestions = subQuestions.filter(sq => 
      sq.question.trim() && sq.answer.trim()
    )

    if (validSubQuestions.length === 0) {
      alert('Please add at least one question with an answer')
      return
    }

    onSubmit({
      imageFile,
      imageUrl: imagePreview,
      subQuestions: validSubQuestions.map(sq => ({
        question: sq.question.trim(),
        answer: sq.answer.trim()
      })),
      marks: parseInt(marks) || 5,
      difficulty
    })

    setImageFile(null)
    setImagePreview('')
    setSubQuestions([{ id: 'sq-1', question: '', answer: '' }])
    setMarks('5')
    setDifficulty('medium')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900 font-medium mb-2">Read the Data and Answer Format</p>
        <p className="text-xs text-blue-800 mb-1">
          1. Upload an image containing data (table, chart, graph, passage, etc.)
        </p>
        <p className="text-xs text-blue-800">
          2. Add questions that students will answer based on the data in the image
        </p>
      </div>

      <div className="space-y-3">
        <Label>Upload Data Image *</Label>
        
        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload image
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG up to 5MB
              </p>
            </label>
          </div>
        ) : (
          <div className="relative border rounded-lg p-4 bg-gray-50">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="absolute top-2 right-2 z-10"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
            <div className="relative w-full h-64 bg-white rounded-lg overflow-hidden">
              <Image
                src={imagePreview}
                alt="Data preview"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {imageFile?.name} ({((imageFile?.size || 0) / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Questions based on the data *</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Add questions that students will answer after reading the data
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSubQuestion}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>

        <div className="space-y-4">
          {subQuestions.map((sq, index) => (
            <div
              key={sq.id}
              className="border rounded-lg p-4 bg-white space-y-3"
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Question {index + 1}</Badge>
                {subQuestions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubQuestion(sq.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`question-${sq.id}`}>
                  Question {index + 1} *
                </Label>
                <Textarea
                  id={`question-${sq.id}`}
                  placeholder="e.g., What is the total population according to the data?"
                  rows={2}
                  value={sq.question}
                  onChange={(e) => updateSubQuestion(sq.id, 'question', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`answer-${sq.id}`}>
                  Answer {index + 1} *
                </Label>
                <Textarea
                  id={`answer-${sq.id}`}
                  placeholder="e.g., The total population is 1.4 billion"
                  rows={2}
                  value={sq.answer}
                  onChange={(e) => updateSubQuestion(sq.id, 'answer', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border">
          <p className="text-xs text-gray-600">
            <strong>Total Questions:</strong> {subQuestions.filter(sq => sq.question.trim() && sq.answer.trim()).length} / {subQuestions.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marks">Total Marks</Label>
          <Input
            id="marks"
            type="number"
            min="1"
            max="20"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Total marks for all questions
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {imagePreview && subQuestions.some(sq => sq.question.trim()) && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-sm font-medium mb-3">Preview:</p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">📊 Data Image: Uploaded</p>
            <p className="text-gray-600">
              📝 Questions: {subQuestions.filter(sq => sq.question.trim()).length}
            </p>
            <div className="mt-2 space-y-1">
              {subQuestions.filter(sq => sq.question.trim()).map((sq, idx) => (
                <p key={sq.id} className="text-xs text-gray-500">
                  Q{idx + 1}: {sq.question.substring(0, 50)}...
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={disabled} className="w-full">
        Add Read Data Question
      </Button>
    </form>
  )
}
