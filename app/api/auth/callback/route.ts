import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user profile exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!existingUser) {
        // Create profile for Google sign-in users
        await supabase.from('users').insert({
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email!,
          role: 'student',
          avatar_url: data.user.user_metadata?.avatar_url,
        })
      }

      // Check role and redirect
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`)
      }
      return NextResponse.redirect(`${origin}/student`)
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_failed`)
}
