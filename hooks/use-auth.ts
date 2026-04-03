'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useAuthActions() {
  const supabase = createClient()
  const router = useRouter()

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/')
    router.refresh()
  }

  return { signIn, signOut }
}
