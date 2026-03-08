import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Recommendation } from '@/types/database'

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('recommendations')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        if (error) throw error

        setRecommendations(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  return { recommendations, loading, error }
}
