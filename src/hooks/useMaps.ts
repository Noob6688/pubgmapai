import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Map } from '@/types/database'

export function useMaps(includeInactive = false) {
  const [maps, setMaps] = useState<Map[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMaps() {
      try {
        const supabase = createClient()
        
        let query = supabase
          .from('maps')
          .select('*')

        if (!includeInactive) {
          query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) throw error

        setMaps(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch maps')
      } finally {
        setLoading(false)
      }
    }

    fetchMaps()
  }, [includeInactive])

  return { maps, loading, error }
}
