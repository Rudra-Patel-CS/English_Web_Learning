export type UserRole = 'admin' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url?: string
  standard?: string
  created_at?: string
  updated_at?: string
}

export interface Standard {
  id: string
  name: string
  description?: string  
  grade_number: number
  created_at?: string
}

export interface Unit {
  id: string
  name: string
  unit_number: number
  standard_id: string
  created_at?: string
  standards?: Standard
}

export interface TextBook {
  id: string
  title: string
  description?: string
  file_url: string
  standard_id: string
  unit_id?: string
  chapter?: string
  author?: string
  uploaded_by?: string
  created_at?: string
  standards?: Standard
  units?: Unit
}

export interface ReadingMaterial {
  id: string
  title: string
  description?: string
  content?: string
  file_url?: string
  standard_id: string
  unit_id?: string
  chapter?: string
  uploaded_by?: string
  created_at?: string
  standards?: Standard
  units?: Unit
}

export interface PracticeTest {
  id: string
  title: string
  description?: string
  file_url?: string
  standard_id: string
  unit_id?: string
  chapter?: string
  total_marks?: number
  duration?: string
  duration_minutes?: number
  questions_count?: number
  is_published?: boolean
  uploaded_by?: string
  created_at?: string
  standards?: Standard
  units?: Unit
}

export interface McqQuestion {
  id: string
  test_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  question_number: number
  created_at?: string
}

export interface VideoLink {
  id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  standard_id: string
  unit_id?: string
  chapter?: string
  duration?: string
  views?: number
  uploaded_by?: string
  created_at?: string
  standards?: Standard
  units?: Unit
}

export interface MaterialItem {
  id: string
  title: string
  description?: string
  file_url?: string
  file_type?: string
  standard_id: string
  unit_id?: string
  chapter?: string
  file_size?: string
  downloads?: number
  uploaded_by?: string
  created_at?: string
  standards?: Standard
  units?: Unit
}

export interface Query {
  id: string
  student_name: string
  student_email: string
  student_id?: string
  subject: string
  doubt: string
  standard?: string
  date?: string
  status: 'pending' | 'answered'
  answer?: string
  answered_by?: string
  answered_at?: string
  created_at?: string
}

export interface MyQuery {
  id: string
  student_id: string
  question: string
  answer?: string
  standard_id?: string
  status: 'pending' | 'answered'
  answered_by?: string
  created_at?: string
  answered_at?: string
  users?: User
  standards?: Standard
}

export interface FAQ {
  id: string
  question: string
  answer: string
  sort_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}
