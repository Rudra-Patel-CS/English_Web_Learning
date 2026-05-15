'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to signin page — signup is now a tab there
    router.replace('/signin')
  }, [router])

  return null
}
