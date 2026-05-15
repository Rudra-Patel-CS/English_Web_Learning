import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

// Create a dummy client that won't throw during SSR/build when env vars are missing
let supabase: SupabaseClient

try {
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    // Fallback: create with a dummy URL to prevent build crashes
    // At runtime with correct env vars, this won't be reached
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
} catch {
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export { supabase }
