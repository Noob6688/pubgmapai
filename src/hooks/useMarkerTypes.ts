import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MarkerType } from '@/types/database'

export function useMarkerTypes(includeInactive = false) {
  const [types, setTypes] = useState<MarkerType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTypes() {
      try {
        const supabase = createClient()
        
        let query = supabase
          .from('marker_types')
          .select('*')
          .order('sort_order')

        if (!includeInactive) {
          query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) throw error

        setTypes(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch marker types')
      } finally {
        setLoading(false)
      }
    }

    fetchTypes()
  }, [includeInactive])

  return { types, loading, error }
}
