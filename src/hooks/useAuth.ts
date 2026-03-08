import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient()
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (result.error) throw result.error

    return result
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) throw error
  }, [])

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }
}
